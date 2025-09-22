import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about-client',
  templateUrl: './about-client.component.html',
  styleUrls: ['./about-client.component.scss']
})
export class AboutClientComponent implements OnInit {

  clientId!:number;
  constructor(private route:ActivatedRoute) {

  }


  ngOnInit(): void {
    const clientId:number = +this.route.snapshot.params['id'];

  }

}
