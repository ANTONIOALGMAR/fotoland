import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { CepService } from '../../shared/services/cep.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let cepServiceSpy: jasmine.SpyObj<CepService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'login', 'uploadProfilePicture']);
    (authServiceSpy as any).isAuthenticated$ = of(false);
    authServiceSpy.register.and.returnValue(of({} as any));
    authServiceSpy.login.and.returnValue(of(void 0));
    authServiceSpy.uploadProfilePicture.and.returnValue(of({ fileUrl: '/uploads/x' } as any));

    cepServiceSpy = jasmine.createSpyObj('CepService', ['lookup']);
    cepServiceSpy.lookup.and.returnValue(of({ address: '', state: '', country: '' } as any));

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        CommonModule,
        FormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CepService, useValue: cepServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
