import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Role } from 'src/app/enum/role.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User = new User();
  currentUser: User = new User();
  displayModalSave: boolean = false;

  selectedInterest: Subject = new Subject();
  subjectsInterests: Subject[] = [];

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  fileToUpload!: File;
  coverFileToUpload!: File;

  activeTab: string = 'activity';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandlerService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private subjectsService: SubjectsService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    const userId = this.route.snapshot.params['userId'];
    if (userId) {
      this.getUserByUserId(userId);
    }
    this.getSubjectsInterests();
    this.scrollToTop();
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getSubjectsInterests() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjectsInterests = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  getUserByUserId(userId: string) {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.userService.getUserByUserId(userId).subscribe(
      (user: User) => {
        this.user = user;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  update(userForm: NgForm) {
    this.showLoading = true;
    this.userService.updateUserProfile(this.user).subscribe(
      (response) => {
        this.user = response;
        this.authenticationService.addUserToLocalCache(response);
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
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

      this.userService.updateProfilePhoto(this.currentUser.email, this.fileToUpload).subscribe(
        response => {
          this.user = response;
        },
        error => {
          console.error('Upload failed', error);
        }
      );
    }
  }

  removeInterest(interest: { name: string }) {
    this.user.subjectsInterests = this.user.subjectsInterests.filter(i => i !== interest);
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/home']);
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
