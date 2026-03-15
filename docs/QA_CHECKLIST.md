# Checklist de QA

- Autenticação:
  - Registrar novo usuário e validar resposta 201.
  - Login e validar cookie `fotoland_jwt` (HttpOnly) no `Set-Cookie`.
  - `/api/user/me` retorna perfil com cookie válido.

- Álbuns:
  - Criar, listar meus, listar públicos.
  - Detalhar, editar título, deletar.

- Posts:
  - Criar em um álbum, listar todos e por álbum.
  - Detalhar, editar, deletar.
  - Curtir, descurtir, contar likes.

- Comentários:
  - Criar em um post, listar por post.
  - Editar, deletar.
  - Curtir, descurtir, contar likes.

- Upload:
  - Enviar `multipart/form-data` autenticado e validar URL retornada.

- Frontend:
  - Cadastro, login, navegação para Home.
  - Criar álbum e post, visualizar feed, curtir/ comentar.
  - Interceptor não envia `Authorization` (auth via cookie) e usa `withCredentials` para o backend.
