import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit, OnDestroy {
  isLogin = true;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  otpSent = false;
  currentPhone = '';
  countdown = 0;
  countdownInterval: any;

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
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.resetOTPState();
  }

  resetOTPState() {
    this.otpSent = false;
    this.currentPhone = '';
    this.countdown = 0;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  async sendOTP() {
    const phone = this.isLogin ? this.loginForm.get('phone')?.value : this.registerForm.get('phone')?.value;
    
    if (!phone || !this.isValidPhone(phone)) {
      this.showErrorToast('Please enter a valid phone number');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Sending OTP...'
    });
    await loading.present();

    this.authService.sendOTP(phone).subscribe(
      async (response) => {
        await loading.dismiss();
        if (response.success) {
          this.otpSent = true;
          this.currentPhone = phone;
          this.startCountdown();
          this.showSuccessToast('OTP sent successfully');
        } else {
          this.showErrorToast(response.message || 'Failed to send OTP');
        }
      },
      async (error) => {
        await loading.dismiss();
        this.showErrorToast('Failed to send OTP. Please try again.');
      }
    );
  }

  startCountdown() {
    this.countdown = 60; // 60 seconds countdown
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  isValidPhone(phone: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Signing in...'
      });
      await loading.present();

      const { phone, otp } = this.loginForm.value;
      
      this.authService.loginWithOTP(phone, otp).subscribe(
        async (success) => {
          await loading.dismiss();
          if (success) {
            this.router.navigate(['/tabs']);
          } else {
            this.showErrorToast('Invalid OTP or phone number');
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

      const { firstName, lastName, phone, otp } = this.registerForm.value;

      this.authService.registerWithOTP({
        firstName,
        lastName,
        phone,
        otp
      }).subscribe(
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

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
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
      if (control.errors['pattern']) {
        if (field === 'phone') return 'Please enter a valid phone number';
        if (field === 'otp') return 'OTP must be 6 digits';
        return 'Please enter a valid format';
      }
    }
    return '';
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}