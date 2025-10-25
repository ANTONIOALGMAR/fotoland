import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: any = {};
  selectedFile: File | null = null;
  selectedFileName: string = '';
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router, private authService: AuthService) { }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      this.authService.uploadProfilePicture(this.selectedFile).subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
          this.user.profilePictureUrl = response.fileUrl; // Assuming the backend returns the URL in this format
          this.registerUser();
        },
        error: (error) => {
          console.error('File upload failed:', error);
          alert('Could not upload profile picture. Please try again.');
        }
      });
    } else {
      this.registerUser();
    }
  }

  registerUser(): void {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('User registered successfully:', response);
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        alert('Registration failed: ' + (error.error.message || error.message));
      }
    });
  }
}
