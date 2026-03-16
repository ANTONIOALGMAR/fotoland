import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './auth/services/auth.interceptor';
import { HttpErrorInterceptor } from './shared/services/http-error.interceptor';
import { NavHeaderComponent } from './shared/nav-header/nav-header.component';
import { ChatInviteAlertComponent } from './shared/components/chat-invite-alert/chat-invite-alert.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { FeedComponent } from './feed/feed.component';
import { CreateAlbumComponent } from './create-album/create-album.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { AlbumDetailComponent } from './album-detail/album-detail.component';
import { ChatComponent } from './chat/chat.component';

// i18n
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    LoginComponent,
    HomeComponent,
    NavHeaderComponent,
    ChatInviteAlertComponent,
    LandingPageComponent,
    FeedComponent,
    CreateAlbumComponent,
    CreatePostComponent,
    AlbumDetailComponent,
    ChatComponent,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'pt'
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
