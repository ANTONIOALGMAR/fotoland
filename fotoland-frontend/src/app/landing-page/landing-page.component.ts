import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavHeaderComponent } from '../shared/nav-header/nav-header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, NavHeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {
  projectDescription = "Conecte-se com amigos e reviva memórias através de álbuns de fotos e vídeos. Cada post é uma viagem ao passado, conectando você aos momentos mais especiais.";
  futuristicImageUrl = "assets/futuristic-background.jpg"; // Use a local image
  constructor(private authService: AuthService, private router: Router, private location: Location) {}
  ngOnInit(): void { this.authService.warmup().subscribe(); }
  irParaPrivado(): void { this.router.navigate(['/private-chat']); }
  irParaColetivo(): void { this.router.navigate(['/chat']); }
  cancelar(): void { /* noop */ }
  voltar(): void { this.location.back(); }
}
