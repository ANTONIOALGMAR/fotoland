import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  constructor(private http: HttpClient) {}

  lookup(cep: string): Observable<{ address: string; state: string; country: string }> {
    const sanitized = (cep || '').replace(/\D/g, '');
    if (sanitized.length !== 8) {
      return new Observable((observer) => observer.error(new Error('CEP inválido')));
    }
    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${sanitized}/json/`).pipe(
      map((res) => {
        if (res?.erro) throw new Error('CEP não encontrado');
        const address = [res.logradouro, res.bairro].filter(Boolean).join(' - ');
        return { address, state: res.uf, country: 'Brasil' };
      })
    );
  }
}