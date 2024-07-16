import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { User } from 'src/app/core/model/User';
import { FeedsService } from 'src/app/feeds/feeds.service';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.css']
})
export class UserProfileViewComponent implements OnInit {

  user: User = new User();
  currentUser: User = new User();

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandlerService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private feedsService: FeedsService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    const userId = this.route.snapshot.params['userId'];
    if (userId) {
      this.getUserByUserId(userId);
    }
  }

  getUserByUserId(userId: string) {
    this.userService.getUserByUserId(userId).subscribe(
      (user: User) => {
        this.user = user;
      },
      (erro) => this.errorHandler.handle(erro),
    );
  }

}
