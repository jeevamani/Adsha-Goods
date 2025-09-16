import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonButton, 
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonCheckbox,
  IonLabel,
  IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
  phonePortraitOutline,
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-auth',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/welcome"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isLogin ? 'Sign In' : 'Sign Up' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="auth-content">
      <div class="auth-container">
        <!-- Header -->
        <div class="auth-header">
          <h1>{{ isLogin ? 'Welcome Back!' : 'Create Account' }}</h1>
          <p>{{ isLogin ? 'Sign in to continue your journey' : 'Join us and start delivering smarter' }}</p>
        </div>

        <!-- Auth Form -->
        <ion-card class="auth-card">
          <ion-card-content>
            <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
              
              <!-- Name field (only for registration) -->
              @if (!isLogin) {
                <ion-item class="auth-item">
                  <ion-icon name="person-outline" slot="start" class="auth-icon"></ion-icon>
                  <ion-input 
                    type="text"
                    placeholder="Full Name"
                    formControlName="name"
                    class="auth-input">
                  </ion-input>
                </ion-item>
              }

              <!-- Email field -->
              <ion-item class="auth-item">
                <ion-icon name="mail-outline" slot="start" class="auth-icon"></ion-icon>
                <ion-input 
                  type="email"
                  placeholder="Email Address"
                  formControlName="email"
                  class="auth-input">
                </ion-input>
              </ion-item>

              <!-- Phone field (only for registration) -->
              @if (!isLogin) {
                <ion-item class="auth-item">
                  <ion-icon name="phone-portrait-outline" slot="start" class="auth-icon"></ion-icon>
                  <ion-input 
                    type="tel"
                    placeholder="Phone Number"
                    formControlName="phone"
                    class="auth-input">
                  </ion-input>
                </ion-item>
              }

              <!-- Password field -->
              <ion-item class="auth-item">
                <ion-icon name="lock-closed-outline" slot="start" class="auth-icon"></ion-icon>
                <ion-input 
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  formControlName="password"
                  class="auth-input">
                </ion-input>
                <ion-button 
                  fill="clear" 
                  slot="end"
                  (click)="togglePassword()"
                  class="password-toggle">
                  <ion-icon 
                    [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"
                    class="password-icon">
                  </ion-icon>
                </ion-button>
              </ion-item>

              <!-- Terms checkbox (only for registration) -->
              @if (!isLogin) {
                <div class="terms-section">
                  <ion-checkbox 
                    formControlName="acceptTerms"
                    class="terms-checkbox">
                  </ion-checkbox>
                  <ion-label class="terms-text">
                    I agree to the <span class="terms-link">Terms & Conditions</span>
                  </ion-label>
                </div>
              }

              <!-- Submit Button -->
              <ion-button 
                type="submit"
                expand="block" 
                class="auth-submit-btn"
                [disabled]="!authForm.valid || isLoading">
                <ion-text>
                  {{ isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account') }}
                </ion-text>
              </ion-button>

            </form>
          </ion-card-content>
        </ion-card>

        <!-- Toggle Auth Mode -->
        <div class="toggle-auth">
          <p>
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <span class="toggle-link" (click)="toggleAuthMode()">
              {{ isLogin ? 'Sign Up' : 'Sign In' }}
            </span>
          </p>
        </div>

        <!-- Forgot Password (only for login) -->
        @if (isLogin) {
          <div class="forgot-password">
            <span class="forgot-link" (click)="forgotPassword()">Forgot Password?</span>
          </div>
        }
      </div>
    </ion-content>

    <ion-toast
      [isOpen]="showToast"
      [message]="toastMessage"
      [duration]="3000"
      (didDismiss)="showToast = false">
    </ion-toast>
  `,
  styleUrls: ['./auth.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonButton,
    IonIcon,
    IonText,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonCheckbox,
    IonLabel,
    IonToast,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class AuthPage {
  isLogin = true;
  showPassword = false;
  isLoading = false;
  showToast = false;
  toastMessage = '';
  authForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    addIcons({ 
      eyeOutline,
      eyeOffOutline,
      mailOutline,
      lockClosedOutline,
      personOutline,
      phonePortraitOutline,
      arrowBackOutline
    });

    this.authForm = this.createForm();
  }

  createForm(): FormGroup {
    const baseForm = {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    };

    if (!this.isLogin) {
      return this.formBuilder.group({
        ...baseForm,
        name: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]]
      });
    }

    return this.formBuilder.group(baseForm);
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
    this.authForm = this.createForm();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.toastMessage = this.isLogin ? 'Login successful!' : 'Account created successfully!';
        this.showToast = true;
        
        // Navigate to home
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      }, 2000);
    }
  }

  forgotPassword() {
    this.toastMessage = 'Password reset link sent to your email';
    this.showToast = true;
  }
}