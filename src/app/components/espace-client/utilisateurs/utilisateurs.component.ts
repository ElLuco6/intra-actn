import {Component, Input, OnInit} from '@angular/core';
import {UserService} from "@services/user.service";
import {AuthenticationService} from "@services/authentication.service";
import {LogClientService} from "@services/log-client.service";
import {Contact} from "@models/contact";
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {FonctionUser} from "@models/fonctionUser";

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {

  listeContact: Contact[] = [];
  foncList: FonctionUser[] = [];
  loading: boolean = false;
  constructor(
    private userService: UserService,
    public auth: AuthenticationService,
    public authClient: LogClientService,
    private http: HttpClient
  ) { }

  idClient: number;

  ngOnInit() {
    setTimeout(() => {
      if(this.authClient.currentClient.id){
        this.idClient = this.authClient.currentClient.id;
        this.getUser();
      } else {
        this.idClient = 0;
      }
    }, 100)

    this.http.get<FonctionUser[]>(`${environment.apiUrl}/fonctionuser.php`).subscribe(
      (data) => {
        data.forEach((d) => {
          if(d.argument != '' && d.argument != ' '){
            this.foncList.push(d);
          }
        });
      }
    )
  }

  getUser(){
    this.userService.getContact(this.idClient).subscribe(
      (data) => {
        this.listeContact = data;
        this.loading = true;
      }
    );
  }
}
