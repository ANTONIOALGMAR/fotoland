import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component'; // Importar HomeComponent
import { LandingPageComponent } from './landing-page/landing-page.component'; // Import LandingPageComponent
import { CreateAlbumComponent } from './create-album/create-album.component'; // Import CreateAlbumComponent
import { FeedComponent } from './feed/feed.component'; // Import FeedComponent
import { CreatePostComponent } from './create-post/create-post.component'; // Import CreatePostComponent
import { AlbumDetailComponent } from './album-detail/album-detail.component'; // Import AlbumDetailComponent
import { AuthGuard } from './auth/guards/auth.guard'; // Import AuthGuard
import { ChatComponent } from './chat/chat.component'; // Import ChatComponent

const routes: Routes = [
  { path: '', component: LandingPageComponent }, // Set LandingPageComponent as the default route
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Proteger com AuthGuard
  { path: 'create-album', component: CreateAlbumComponent, canActivate: [AuthGuard] }, // Proteger com AuthGuard
  { path: 'edit-album/:id', component: CreateAlbumComponent, canActivate: [AuthGuard] }, // Proteger com AuthGuard
  { path: 'album/:id', component: AlbumDetailComponent, canActivate: [AuthGuard] }, // Proteger com AuthGuard
  { path: 'create-post', component: CreatePostComponent, canActivate: [AuthGuard] }, // Proteger com AuthGuard
  { path: 'create-post/:albumId', component: CreatePostComponent, canActivate: [AuthGuard] }, // Rota para criar post em um álbum específico
  { path: 'edit-post/:id', component: CreatePostComponent, canActivate: [AuthGuard] }, // Rota para editar post
  { path: 'feed', component: FeedComponent, canActivate: [AuthGuard] }, // Proteger com AuthGuard
  { 
    path: 'private-chat', 
    loadComponent: () => import('./chat/private-chat.component').then(m => m.PrivateChatComponent), 
    canActivate: [AuthGuard] 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
