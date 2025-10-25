import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component'; // Importar HomeComponent
import { LandingPageComponent } from './landing-page/landing-page.component'; // Import LandingPageComponent
import { CreateAlbumComponent } from './create-album/create-album.component'; // Import CreateAlbumComponent
import { FeedComponent } from './feed/feed.component'; // Import FeedComponent
import { CreatePostComponent } from './create-post/create-post.component'; // Import CreatePostComponent

const routes: Routes = [
  { path: '', component: LandingPageComponent }, // Set LandingPageComponent as the default route
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent }, // Adicionar rota para /home
  { path: 'create-album', component: CreateAlbumComponent }, // Add route for CreateAlbumComponent
  { path: 'create-post', component: CreatePostComponent }, // Add route for CreatePostComponent
  { path: 'create-post/:id', component: CreatePostComponent }, // Add route for editing posts
  { path: 'feed', component: FeedComponent }, // Add route for FeedComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
