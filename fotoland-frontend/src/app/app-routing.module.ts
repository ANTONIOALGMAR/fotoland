import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component'; // Importar HomeComponent
import { LandingPageComponent } from './landing-page/landing-page.component'; // Import LandingPageComponent

const routes: Routes = [
  { path: '', component: LandingPageComponent }, // Set LandingPageComponent as the default route
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent }, // Adicionar rota para /home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
