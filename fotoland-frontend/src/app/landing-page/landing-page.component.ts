import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink], // Add RouterLink to imports
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {
  projectDescription = "Conecte-se com amigos e reviva memórias através de álbuns de fotos e vídeos. Cada post é uma viagem ao passado, conectando você aos momentos mais especiais.";
  futuristicImageUrl = "assets/futuristic-background.jpg"; // Use a local image
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.warmup().subscribe();
  }
}
