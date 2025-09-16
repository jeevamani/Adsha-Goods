
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLogin = true;
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeForms();
  }

  private initializeForms() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Signing in...'
      });
      await loading.present();

      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe(
        async (success) => {
          await loading.dismiss();
          if (success) {
            this.router.navigate(['/tabs']);
          } else {
            this.showErrorToast('Invalid email or password');
          }
        },
        async (error) => {
          await loading.dismiss();
          this.showErrorToast('Login failed. Please try again.');
        }
      );
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creating account...'
      });
      await loading.present();

      this.authService.register(this.registerForm.value).subscribe(
        async (success) => {
          await loading.dismiss();
          if (success) {
            this.router.navigate(['/tabs']);
          } else {
            this.showErrorToast('Registration failed. Please try again.');
          }
        },
        async (error) => {
          await loading.dismiss();
          this.showErrorToast('Registration failed. Please check your information.');
        }
      );
    }
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${field} is required`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `${field} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['pattern']) return 'Please enter a valid phone number';
    }
    return '';

  }
}