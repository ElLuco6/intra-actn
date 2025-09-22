import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";

@Component({
  selector: 'app-actu',
  templateUrl: './actu.component.html',
  styleUrls: ['./actu.component.scss']
})
export class ActuComponent implements OnInit {

  actus: Array<any>
  responsiveOptions;

  constructor(
    private http: HttpClient
  ) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 5,
        numScroll: 5,
      },
      {
        breakpoint: '840px',
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  ngOnInit(): void {
    this.getActu();
  }

  getActu(){
    return this.http.get(`${environment.apiUrl}/xmllecture.php`).subscribe(
      (data: Array<any>) => {
        const regex = /data-orig-file="([^"]+)"/;
        data.forEach((e) => {
          e.description = regex.exec(decodeURIComponent(e.description))?.[1];
        })
        this.actus = data
      }
    )
  }

}
