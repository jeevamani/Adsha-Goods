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
  carOutline, 
  shieldCheckmarkOutline, 
  walletOutline,
  arrowForwardOutline,
  trendingUpOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  template: `
    <ion-content class="welcome-content">
      <div class="welcome-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="logo-container">
            <ion-icon name="car-outline" class="logo-icon"></ion-icon>
          </div>
          <h1 class="hero-title">
            Drive with
            <span class="brand-name">Adsha Goods</span>
          </h1>
          <p class="hero-subtitle">
            Start earning with flexible hours. Be your own boss.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon name="wallet-outline" class="feature-icon"></ion-icon>
              <h3>Earn More</h3>
              <p>Competitive rates and instant payments</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon name="trending-up-outline" class="feature-icon"></ion-icon>
              <h3>Grow Your Business</h3>
              <p>Build your reputation and customer base</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon name="shield-checkmark-outline" class="feature-icon"></ion-icon>
              <h3>Safe & Secure</h3>
              <p>Insurance coverage and 24/7 support</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon name="car-outline" class="feature-icon"></ion-icon>
              <h3>Flexible Hours</h3>
              <p>Work when you want, where you want</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- CTA Button -->
        <div class="cta-section">
          <ion-button 
            expand="block" 
            class="cta-button"
            (click)="navigateToAuth()">
            <ion-text>Start Driving</ion-text>
            <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
          </ion-button>
          
          <p class="login-text">
            Already a driver? 
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
      carOutline, 
      shieldCheckmarkOutline, 
      walletOutline,
      arrowForwardOutline,
      trendingUpOutline
    });
  }

  navigateToAuth() {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}