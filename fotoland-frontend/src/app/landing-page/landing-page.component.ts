import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Import RouterLink for navigation

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink], // Add RouterLink to imports
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  projectDescription = "Conecte-se com amigos e reviva memórias através de álbuns de fotos e vídeos. Cada post é uma viagem ao passado, conectando você aos momentos mais especiais.";
  futuristicImageUrl = "https://via.placeholder.com/1200x600?text=Futuristic+Photo+Placeholder"; // Placeholder image
}
