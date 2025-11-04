#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080}"

info() { printf "[INFO] %s\n" "$*"; }
ok() { printf "[OK]   %s\n" "$*"; }
err() { printf "[ERR]  %s\n" "$*" >&2; }

has_jq=false
if command -v jq >/dev/null 2>&1; then
  has_jq=true
fi

json_get() {
  # Fallback simples quando jq não existe; usa sed para extrair um campo string
  local key="$1"; shift
  sed -n "s/.*\"${key}\":\"\\([^\"]*\\)\".*/\\1/p"
}

require_backend() {
  info "Verificando backend em ${API_BASE}..."
  if ! curl -sSf "${API_BASE}/actuator/health" >/dev/null 2>&1; then
    info "Endpoint /actuator/health não disponível; tentando /api/user/me sem token para validar 401..."
    code=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/api/user/me" || true)
    if [[ "${code}" != "401" ]]; then
      err "Backend não parece estar rodando em ${API_BASE}. Inicie com './mvnw spring-boot:run'."
      exit 1
    fi
  fi
  ok "Backend respondendo."
}

register_user() {
  local username="$1" password="$2" full="$3"
  info "Registrando usuário '${username}'..."
  payload=$(cat <<EOF
{"fullName":"${full}","username":"${username}","password":"${password}","phoneNumber":"559999999","address":"Rua QA, 100","profilePictureUrl":""}
EOF
)
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_BASE}/api/auth/register" \
    -H "Content-Type: application/json" -d "${payload}")
  if [[ "${code}" != "201" ]]; then
    err "Falha ao registrar (HTTP ${code})."
    exit 1
  fi
  ok "Usuário registrado com sucesso."
}

login_user() {
  local username="$1" password="$2"
  info "Fazendo login..."
  resp=$(curl -s -X POST "${API_BASE}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${username}\",\"password\":\"${password}\"}")
  if ${has_jq}; then
    TOKEN=$(printf "%s" "${resp}" | jq -r '.jwt')
  else
    TOKEN=$(printf "%s" "${resp}" | json_get "jwt")
  fi
  if [[ -z "${TOKEN:-}" || "${TOKEN}" != *.*.* ]]; then
    err "Token JWT inválido."
    exit 1
  fi
  ok "Login ok. Token capturado."
}

user_me() {
  info "Consultando /api/user/me..."
  code=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/api/user/me" -H "Authorization: Bearer ${TOKEN}")
  if [[ "${code}" != "200" ]]; then
    err "Falha ao obter perfil (HTTP ${code})."
    exit 1
  fi
  ok "Perfil retornado com sucesso."
}

create_album() {
  info "Criando álbum..."
  resp=$(curl -s -X POST "${API_BASE}/api/albums" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"title":"Álbum QA","description":"Criado pelo smoke test","type":"GENERAL"}')
  if ${has_jq}; then
    ALBUM_ID=$(printf "%s" "${resp}" | jq -r '.id')
  else
    ALBUM_ID=$(printf "%s" "${resp}" | sed -n 's/.*"id":\([0-9]\+\).*/\1/p')
  fi
  if [[ -z "${ALBUM_ID:-}" ]]; then
    err "Não foi possível obter o ID do álbum."
    exit 1
  fi
  ok "Álbum criado. ID=${ALBUM_ID}"
}

create_post() {
  info "Criando post no álbum ${ALBUM_ID}..."
  resp=$(curl -s -X POST "${API_BASE}/api/posts/album/${ALBUM_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"title":"Post QA","content":"Conteúdo de teste","type":"PHOTO","mediaUrl":"https://example.com/foto.jpg"}')
  if ${has_jq}; then
    POST_ID=$(printf "%s" "${resp}" | jq -r '.id')
  else
    POST_ID=$(printf "%s" "${resp}" | sed -n 's/.*"id":\([0-9]\+\).*/\1/p')
  fi
  if [[ -z "${POST_ID:-}" ]]; then
    err "Não foi possível obter o ID do post."
    exit 1
  fi
  ok "Post criado. ID=${POST_ID}"
}

like_post() {
  info "Curtindo post ${POST_ID}..."
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_BASE}/api/posts/${POST_ID}/like" -H "Authorization: Bearer ${TOKEN}")
  if [[ "${code}" != "200" && "${code}" != "204" ]]; then
    err "Falha ao curtir post (HTTP ${code})."
    exit 1
  fi
  count=$(curl -s "${API_BASE}/api/posts/${POST_ID}/likes/count")
  ok "Post curtido. Likes=${count}"
}

comment_flow() {
  info "Criando comentário em post ${POST_ID}..."
  resp=$(curl -s -X POST "${API_BASE}/api/comments/post/${POST_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"content":"Comentário QA"}')
  if ${has_jq}; then
    COMMENT_ID=$(printf "%s" "${resp}" | jq -r '.id')
  else
    COMMENT_ID=$(printf "%s" "${resp}" | sed -n 's/.*"id":\([0-9]\+\).*/\1/p')
  fi
  [[ -z "${COMMENT_ID:-}" ]] && { err "Não foi possível obter ID do comentário."; exit 1; }
  ok "Comentário criado. ID=${COMMENT_ID}"

  info "Curtindo comentário ${COMMENT_ID}..."
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_BASE}/api/comments/${COMMENT_ID}/like" -H "Authorization: Bearer ${TOKEN}")
  [[ "${code}" != "200" && "${code}" != "204" ]] && { err "Falha ao curtir comentário (HTTP ${code})."; exit 1; }
  count=$(curl -s "${API_BASE}/api/comments/${COMMENT_ID}/likes/count")
  ok "Comentário curtido. Likes=${count}"
}

upload_dummy() {
  info "Testando upload público com dummy.txt..."
  if [[ ! -f "dummy.txt" ]]; then
    err "Arquivo dummy.txt não encontrado no diretório raiz do projeto."
    return 0
  fi
  resp=$(curl -s -X POST "${API_BASE}/api/upload" -F "file=@dummy.txt")
  ok "Upload retornou: ${resp}"
}

list_endpoints() {
  info "Listando álbuns públicos..."
  curl -s "${API_BASE}/api/albums" >/dev/null && ok "Álbuns listados."

  info "Listando posts..."
  curl -s "${API_BASE}/api/posts" >/dev/null && ok "Posts listados."
}

update_and_delete() {
  info "Atualizando álbum ${ALBUM_ID}..."
  code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${API_BASE}/api/albums/${ALBUM_ID}" \
    -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
    -d '{"title":"Álbum QA Editado"}')
  [[ "${code}" != "200" ]] && { err "Falha ao atualizar álbum (HTTP ${code})."; exit 1; }
  ok "Álbum atualizado."

  info "Atualizando post ${POST_ID}..."
  code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${API_BASE}/api/posts/${POST_ID}" \
    -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" \
    -d '{"title":"Post QA Editado"}')
  [[ "${code}" != "200" ]] && { err "Falha ao atualizar post (HTTP ${code})."; exit 1; }
  ok "Post atualizado."

  info "Deletando post ${POST_ID}..."
  code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API_BASE}/api/posts/${POST_ID}" -H "Authorization: Bearer ${TOKEN}")
  [[ "${code}" != "200" && "${code}" != "204" ]] && { err "Falha ao deletar post (HTTP ${code})."; exit 1; }
  ok "Post deletado."

  info "Deletando álbum ${ALBUM_ID}..."
  code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API_BASE}/api/albums/${ALBUM_ID}" -H "Authorization: Bearer ${TOKEN}")
  [[ "${code}" != "200" && "${code}" != "204" ]] && { err "Falha ao deletar álbum (HTTP ${code})."; exit 1; }
  ok "Álbum deletado."
}

main() {
  require_backend
  USERNAME="qauser_$(date +%s)"
  PASSWORD="Senha123!"
  FULLNAME="Usuário QA"
  register_user "${USERNAME}" "${PASSWORD}" "${FULLNAME}"
  login_user "${USERNAME}" "${PASSWORD}"
  user_me
  create_album
  create_post
  like_post
  comment_flow
  list_endpoints
  upload_dummy
  update_and_delete
  ok "Smoke test concluído com sucesso."
}

main "$@"