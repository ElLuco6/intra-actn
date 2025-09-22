import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "@services/authentication.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  @Output() EventLogIn = new EventEmitter<void>();
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();

  connectionFailure = false;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });

  }

  logIn(){
    this.authService.login(
      encodeURIComponent(this.loginForm.get('login').value),
      encodeURIComponent(this.loginForm.get('password').value)
    ).subscribe((user) => {
      if(user.error == undefined){
        this.EventLogIn.emit();
        window.location.reload()
      }else{
        this.connectionFailure = true;
      }
    });
    this.inputUnFocused();
  }

  inputFocused() {
    this.hasFocusedInputChange.emit(true);
  }

  inputUnFocused() {
    this.hasFocusedInputChange.emit(false);
  }

}
