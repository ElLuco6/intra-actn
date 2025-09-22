import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {
  @Input() step = 1;

  page: string;

  constructor(
    private router: Router,
    protected route: ActivatedRoute) { }

  ngOnInit(): void {
    this.page =  decodeURIComponent(this.route.snapshot.url[this.route.snapshot.url.length - 1]?.path ?? '');
  }
}
