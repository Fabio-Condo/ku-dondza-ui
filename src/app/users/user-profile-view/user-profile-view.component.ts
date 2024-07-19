import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { User } from 'src/app/core/model/User';
import { FeedsService } from 'src/app/feeds/feeds.service';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-profile-view',
  templateUrl: './user-profile-view.component.html',
  styleUrls: ['./user-profile-view.component.css']
})
export class UserProfileViewComponent implements OnInit {

  user: User = new User();
  currentUser: User = new User();
  displayModalSave: boolean = false;

  fileToUpload!: File;
  coverFileToUpload!: File;

  isProfilePhoto: boolean = true;

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

  update(userForm: NgForm) {
    this.userService.update(this.user).subscribe(
      (response) => {
        this.authenticationService.addUserToLocalCache(response);
        this.user = response;
        this.messageService.add({ severity: 'success', detail: 'Courso alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  onUpdateCurrentUser(): void {
    this.displayModalSave = true;
  }

  onProfilePhotoFileChange(event: any) {
    console.log('Clicking here 1');
    if (event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];

      this.userService.updateProfilePhoto(this.currentUser.username, this.fileToUpload).subscribe(
        response => {
          this.user = response;
          console.log('Upload successful', response);
        },
        error => {
          console.error('Upload failed', error);
        }
      );
    }
  }

  onProfileCoverPhotoFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.coverFileToUpload = event.target.files[0];

      this.userService.updateProfileCoverPhoto(this.currentUser.username, this.coverFileToUpload).subscribe(
        response => {
          this.user = response;
          console.log('Upload successful', response);
        },
        error => {
          console.error('Upload failed', error);
        }
      );
    }
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
