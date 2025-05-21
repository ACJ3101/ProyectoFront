import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/authService/auth.service';
import { UserService } from '../../../core/services/userService/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule, ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  rememberMe: boolean = true;
  isVisible: boolean = true;
  errorMessage: boolean = false;
  isLoading: boolean = false;
  formSubmitted: boolean = false;
  showModal: boolean = false; // Controla la visibilidad del modal
  idiomaActual:string = 'es';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [true]
    });


  }

  ngOnInit() {
    // Verificar si debe mostrarse el modal de cierre de sesión
    // this.logOutModalService.getModal().subscribe(show => {
    //   this.showModal = show;
    // });

    const EMAIL = localStorage.getItem('email');
    if (EMAIL) {
      this.loginForm.patchValue({ email: EMAIL, rememberMe: true });
    }


  }

  // closeModal() {
  //   this.showModal = false;
  //   this.logOutModalService.setModal(false);
  // }

  changeVisible() {
    this.isVisible = !this.isVisible;
  }

  login(): void {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // this.isLoading = true;
    // let { email, password, rememberMe } = this.loginForm.value;

    // this.authService.login(email, password, rememberMe).subscribe({
    //   next: () => {
    //     this.userService.setUserName().subscribe({
    //       next: () => {
    //         this.router.navigate(['/home']);
    //       },
    //       error: (err) => console.error(err)
    //     });
    //   },
    //   error: () => {
    //     this.errorMessage = true;
    //     this.isLoading = false;
    //     setTimeout(() => {
    //       this.errorMessage = false;
    //     }, 4000);
    //   }
    // });
  }
}

