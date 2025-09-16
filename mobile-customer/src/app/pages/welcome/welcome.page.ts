import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonButton, 
  IonIcon,
  IonText,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  rocketOutline, 
  shieldCheckmarkOutline, 
  flashOutline,
  arrowForwardOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  template: `
    <ion-content class="welcome-content">
      <div class="welcome-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="logo-container">
            <ion-icon name="rocket-outline" class="logo-icon"></ion-icon>
          </div>
          <h1 class="hero-title">
            Welcome to
            <span class="brand-name">Adsha Goods</span>
          </h1>
          <p class="hero-subtitle">
            Your trusted delivery partner. Fast, reliable, and secure.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon name="flash-outline" class="feature-icon"></ion-icon>
              <h3>Lightning Fast</h3>
              <p>Quick pickups and deliveries across the city</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon name="shield-checkmark-outline" class="feature-icon"></ion-icon>
              <h3>100% Secure</h3>
              <p>Your packages are safe with us</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- CTA Button -->
        <div class="cta-section">
          <ion-button 
            expand="block" 
            class="cta-button"
            (click)="navigateToAuth()">
            <ion-text>Get Started</ion-text>
            <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
          </ion-button>
          
          <p class="login-text">
            Already have an account? 
            <span class="login-link" (click)="navigateToLogin()">Sign In</span>
          </p>
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./welcome.page.scss'],
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonText,
    IonCard,
    IonCardContent
  ]
})
export class WelcomePage {
  constructor(private router: Router) {
    addIcons({ 
      rocketOutline, 
      shieldCheckmarkOutline, 
      flashOutline,
      arrowForwardOutline 
    });
  }

  navigateToAuth() {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}