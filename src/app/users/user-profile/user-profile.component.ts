import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from 'src/app/core/model/User';
import { FileUploadStatus } from 'src/app/core/model/file-upload.status';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] = [];
  public user: User = new User;
  public refreshing: boolean = false;
  public selectedUser: User = new User;
  public fileName: any;
  public profileImage: any;
  private subscriptions: Subscription[] = [];
  public editUser = new User();
  private currentUsername: string = '';
  public fileStatus = new FileUploadStatus();
  exbindoFormularioChangePass: boolean = false;
  
  roles = [
    { label: 'USER', value: 'ROLE_USER' },
    { label: 'ADMIN', value: 'ROLE_ADMIN' },
    { label: 'SUPER ADMIN', value: 'ROLE_SUPER_ADMIN' },
  ];


  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private messageService: MessageService,
    private title: Title,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUsername = this.authenticationService.getUserFromLocalCache().username;
    const formData = this.userService.createUserFormDate(this.currentUsername, user, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.addUserToLocalCache(response);
          //this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          this.refreshing = false;
          this.messageService.add({ severity: 'success', detail: `${response.firstName} ${response.lastName} password updated successfully` });
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(errorResponse.error.message);
          this.refreshing = false;
          this.profileImage = null;
        }
      )
    );
  }

  onProfileImageChange(fileName: any, profileImage: any): void {
    this.fileName = fileName.target.files[0].name;
    this.profileImage = profileImage.target.files[0];
  }

  public updateProfileImage(): void {
    //this.clickButton('profile-image-input');
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.messageService.add({ severity: 'success', detail: `You've been successfully logged out` });
    //this.sendNotification(`You've been successfully logged out`);
  }

  private sendNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  prepararImportPassworChange() {
    this.exbindoFormularioChangePass = true;
  }

}
