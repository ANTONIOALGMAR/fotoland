import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { CreateAlbumComponent } from './create-album/create-album.component';
import { FeedComponent } from './feed/feed.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { AlbumDetailComponent } from './album-detail/album-detail.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'create-album', component: CreateAlbumComponent, canActivate: [AuthGuard] },
  { path: 'edit-album/:id', component: CreateAlbumComponent, canActivate: [AuthGuard] },
  { path: 'album/:id', component: AlbumDetailComponent, canActivate: [AuthGuard] },
  { path: 'create-post', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'create-post/:albumId', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'edit-post/:id', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'feed', component: FeedComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { 
    path: 'private-chat', 
    loadComponent: () => import('./chat/private-chat.component').then(m => m.PrivateChatComponent), 
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
