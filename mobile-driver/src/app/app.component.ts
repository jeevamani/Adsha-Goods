import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    // Check if user is already logged in
    this.authService.checkAuthStatus().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/tabs']);
      } else {
        this.router.navigate(['/auth']);
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Platform ready, do any higher level native things you might need.
    });
  }
}