import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton, 
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonBadge,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  locationOutline,
  timeOutline,
  walletOutline,
  notificationsOutline,
  personOutline,
  carOutline,
  cubeOutline,
  trendingUpOutline,
  starOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <div class="header-content">
            <ion-avatar class="user-avatar">
              <img src="https://via.placeholder.com/40x40" alt="Profile">
            </ion-avatar>
            <div class="user-info">
              <div class="greeting">Good morning!</div>
              <div class="user-name">{{ userName }}</div>
            </div>
          </div>
        </ion-title>
        <ion-button fill="clear" slot="end" (click)="openNotifications()">
          <ion-icon name="notifications-outline"></ion-icon>
          @if (notificationCount > 0) {
            <ion-badge class="notification-badge">{{ notificationCount }}</ion-badge>
          }
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="home-container">
        
        <!-- Quick Actions -->
        <div class="section">
          <h2 class="section-title">Quick Actions</h2>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-card class="action-card" (click)="quickBook()">
                  <ion-card-content>
                    <ion-icon name="package-outline" class="action-icon primary"></ion-icon>
                    <div class="action-title">Book Now</div>
                    <div class="action-subtitle">Quick delivery</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="action-card" (click)="scheduleBook()">
                  <ion-card-content>
                    <ion-icon name="time-outline" class="action-icon secondary"></ion-icon>
                    <div class="action-title">Schedule</div>
                    <div class="action-subtitle">Plan ahead</div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Stats Card -->
        <div class="section">
          <ion-card class="stats-card">
            <ion-card-content>
              <h3>Your Activity</h3>
              <ion-grid>
                <ion-row>
                  <ion-col size="4" class="stat-item">
                    <div class="stat-number">{{ stats.totalOrders }}</div>
                    <div class="stat-label">Total Orders</div>
                  </ion-col>
                  <ion-col size="4" class="stat-item">
                    <div class="stat-number">₹{{ stats.totalSpent }}</div>
                    <div class="stat-label">Total Spent</div>
                  </ion-col>
                  <ion-col size="4" class="stat-item">
                    <div class="stat-number">{{ stats.savedTime }}h</div>
                    <div class="stat-label">Time Saved</div>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Recent Orders -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Recent Orders</h2>
            <ion-button fill="clear" size="small" (click)="viewAllOrders()">
              <ion-text>View All</ion-text>
            </ion-button>
          </div>
          
          <div class="orders-list">
            @for (order of recentOrders; track order.id) {
              <ion-card 
                class="order-card"
                (click)="viewOrderDetails(order.id)">
                <ion-card-content>
                  <div class="order-header">
                    <div class="order-id">#{{ order.id }}</div>
                    <ion-badge 
                      [color]="getStatusColor(order.status)" 
                      class="status-badge">
                      {{ order.status }}
                    </ion-badge>
                  </div>
                  <div class="order-route">
                    <div class="location-point">
                      <ion-icon name="location-outline"></ion-icon>
                      <span>{{ order.pickup }}</span>
                    </div>
                    <div class="route-line"></div>
                    <div class="location-point">
                      <ion-icon name="location-outline"></ion-icon>
                      <span>{{ order.delivery }}</span>
                    </div>
                  </div>
                  <div class="order-footer">
                    <div class="order-date">{{ order.date }}</div>
                    <div class="order-amount">₹{{ order.amount }}</div>
                  </div>
                </ion-card-content>
              </ion-card>
            }
          </div>
        </div>

        <!-- Service Categories -->
        <div class="section">
          <h2 class="section-title">Services</h2>
          <ion-grid>
            <ion-row>
              @for (service of services; track service.name) {
                <ion-col size="6">
                  <ion-card class="service-card" (click)="selectService(service)">
                    <ion-card-content>
                      <ion-icon [name]="service.icon" class="service-icon"></ion-icon>
                      <div class="service-title">{{ service.name }}</div>
                      <div class="service-description">{{ service.description }}</div>
                    </ion-card-content>
                  </ion-card>
                </ion-col>
              }
            </ion-row>
          </ion-grid>
        </div>

      </div>

      <!-- FAB -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button class="fab-button" (click)="quickBook()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styleUrls: ['./home.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonText,
    IonCard,
    IonCardContent,
    IonBadge,
    IonFab,
    IonFabButton,
    IonGrid,
    IonRow,
    IonCol,
    IonAvatar,
    IonRefresher,
    IonRefresherContent,
    CommonModule
  ]
})
export class HomePage implements OnInit {
  userName = 'John Doe';
  notificationCount = 3;
  
  stats = {
    totalOrders: 24,
    totalSpent: 2450,
    savedTime: 48
  };

  recentOrders = [
    {
      id: 'ORD001',
      status: 'Delivered',
      pickup: 'MG Road',
      delivery: 'Koramangala',
      date: 'Today, 2:30 PM',
      amount: 150
    },
    {
      id: 'ORD002',
      status: 'In Transit',
      pickup: 'Brigade Road',
      delivery: 'HSR Layout',
      date: 'Today, 4:15 PM',
      amount: 200
    }
  ];

  services = [
    {
      name: 'Same Day',
      description: 'Delivered today',
      icon: 'car-outline'
    },
    {
      name: 'Express',
      description: 'Within 2 hours',
      icon: 'trending-up-outline'
    },
    {
      name: 'Standard',
      description: '1-2 business days',
      icon: 'cube-outline'
    },
    {
      name: 'Premium',
      description: 'Extra care',
      icon: 'star-outline'
    }
  ];

  constructor(private router: Router) {
    addIcons({ 
      addOutline,
      locationOutline,
      timeOutline,
      walletOutline,
      notificationsOutline,
      personOutline,
      carOutline,
      cubeOutline,
      trendingUpOutline,
      starOutline
    });
  }

  ngOnInit() {
    // Load user data and recent orders
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Refresh data
      event.target.complete();
    }, 2000);
  }

  openNotifications() {
    // Open notifications modal/page
  }

  quickBook() {
    this.router.navigate(['/booking']);
  }

  scheduleBook() {
    this.router.navigate(['/booking'], { queryParams: { schedule: true } });
  }

  viewAllOrders() {
    this.router.navigate(['/history']);
  }

  viewOrderDetails(orderId: string) {
    this.router.navigate(['/tracking', orderId]);
  }

  selectService(service: any) {
    this.router.navigate(['/booking'], { queryParams: { service: service.name } });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'in transit': return 'warning';
      case 'pending': return 'medium';
      default: return 'primary';
    }
  }
}