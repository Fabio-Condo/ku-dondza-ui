import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent  implements OnInit {

  constructor(
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Quizzes page');
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
