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
import { Post } from 'src/app/core/model/Post';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IPostFilter } from 'src/app/core/interface/IPostFilter';
import { InterestService } from 'src/app/interest/interest.service';
import { Interest } from 'src/app/core/model/Interest';

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


  posts: Post[] = [];
  currentPage: number = 1;
  totalRegistros: number = 0

  extension: any;

  interests: any[] = [];
  showInterestsDialog: boolean = false;
  showSelectInterestsDialog: boolean = false;

  showLoading: boolean = false;

  selectedInterest: Interest = new Interest();


  //isProfilePhoto: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private errorHandler: ErrorHandlerService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private feedsService: FeedsService,
    private interestService: InterestService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    const userId = this.route.snapshot.params['userId'];
    if (userId) {
      this.getUserByUserId(userId);
    }
    this.getInterests();
  }

  filtro: IPostFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc'
  }

  getUserByUserId(userId: string) {
    this.userService.getUserByUserId(userId).subscribe(
      (user: User) => {
        this.user = user;
        this.getUserPostsByUserId(user);
      },
      (erro) => this.errorHandler.handle(erro),
    );
  }

  update(userForm: NgForm) {
    this.userService.updateUserProfile(this.user).subscribe(
      (response) => {
        this.user = response;
        this.authenticationService.addUserToLocalCache(response);
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

  getUserPostsByUserId(user: User): void {
    this.filtro.page++;
    this.feedsService.getUserPostsByUserId(user.id, this.filtro).subscribe(
      (dados: IApiResponse<Post>) => {
        this.posts = [...this.posts, ...dados.content];
        this.totalRegistros = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getInterests() {
    return this.interestService.getAll().subscribe(
      dados => {
        this.interests = dados.map(dado => {
          return {
            label: dado.description,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  addInterestToUserInterests() {
    this.userService.addInterestToUserInterests(this.user.id, this.selectedInterest.id).subscribe(
      (user) => {
        this.user = user;
        this.messageService.add({ severity: 'success', detail: 'Interest added successfully!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  onShowPostComments() {
    this.filtro.itemsPerPage = 5;
    this.getUserPostsByUserId(this.user);
  }

  isImageUrl(url: string): boolean {
    if (!url) return false; // Verifica se a URL é válida
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    this.extension = url.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(this.extension);
  }

  isVideoUrl(url: string): boolean {
    if (!url) return false; // Verifica se a URL é válida
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
    this.extension = url.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(this.extension);
  }

  timeElapsed(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      const remainingMonths = months % 12;
      return `${years} ano${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}` : ''}`;
    } else if (months > 0) {
      const remainingDays = days % 30;
      return `${months} mês${months > 1 ? 'es' : ''}${remainingDays > 0 ? ` e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}` : ''}`;
    } else if (weeks > 0) {
      const remainingDays = days % 7;
      return `${weeks} semana${weeks > 1 ? 's' : ''}${remainingDays > 0 ? ` e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}` : ''}`;
    } else if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours} hora${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` e ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}` : ''}`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes} minuto${minutes > 1 ? 's' : ''}${remainingSeconds > 0 ? ` e ${remainingSeconds} segundo${remainingSeconds > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
    }
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
  }

  onShowInterests() {
    this.showInterestsDialog = true;
  }

  onCloseInterests() {
    this.showInterestsDialog = false;
  }

  onShowSelectInterests() {
    this.showSelectInterestsDialog = true;
  }

  onCloseSelectInterests() {
    this.showSelectInterestsDialog = false;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
