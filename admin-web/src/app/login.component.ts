import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <h1>Adsha Goods</h1>
          <h2>Admin Portal</h2>
        </div>
        
        <form class="login-form" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="admin@adshagoods.com" 
              [(ngModel)]="loginForm.email"
              required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password" 
              [(ngModel)]="loginForm.password"
              required>
          </div>
          
          <button type="submit" class="login-btn" [disabled]="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="login-footer">
          <p>Default admin credentials: admin@adshagoods.com / Admin@123</p>
          <p><small>Backend API: http://localhost:5000</small></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .login-card {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      margin: 1rem;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-section h1 {
      color: #333;
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    .logo-section h2 {
      color: #666;
      font-size: 1.2rem;
      margin: 0;
      font-weight: 400;
    }

    .login-form {
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .login-btn {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.875rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .login-footer {
      text-align: center;
    }

    .login-footer p {
      color: #666;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }

    .login-footer small {
      color: #999;
      font-size: 0.8rem;
    }
  `]
})
export class LoginComponent {
  loginForm = {
    email: '',
    password: ''
  };
  
  isLoading = false;

  onLogin() {
    if (!this.loginForm.email || !this.loginForm.password) {
      alert('Please enter both email and password');
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.loginForm.email === 'admin@adshagoods.com' && this.loginForm.password === 'Admin@123') {
        alert('Login successful! Redirecting to dashboard...');
        // In a real app, you would navigate to the dashboard
      } else {
        alert('Invalid credentials. Please try: admin@adshagoods.com / Admin@123');
      }
      this.isLoading = false;
    }, 1500);
  }
}