import { Component } from '@angular/core';
import { ProgressService } from '../progress.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicService } from 'src/app/topics/topicsService.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent {

    constructor(
      private progressService: ProgressService,
      private subjectsService: SubjectsService,
      private topicService: TopicService,
      private authenticationService: AuthenticationService,
      private messageService: MessageService,
      private route: ActivatedRoute,
      private router: Router,
      private title: Title,
    ) { }
}
