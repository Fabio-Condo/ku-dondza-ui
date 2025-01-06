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
import { IUserFilter } from 'src/app/core/model/IUserFilter';
import { CommentService } from 'src/app/core/commets/commentService .service';
import { LikeService } from 'src/app/core/likes/like.service';
import { UserCourseService } from 'src/app/user-courses/user-curses.service';
import { UserCourse } from 'src/app/core/model/UserCourse';
import { UserCourseFilter } from 'src/app/core/interface/UserCourseFilter';
import { CourseService } from 'src/app/courses/courseService.service';
import { InstitutionService } from 'src/app/institutions/InstitutionService.service';
import { Course } from 'src/app/core/model/Course';

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
  totalRegistros: number = 0

  friends: User[] = [];
  totalRegistrosAmigos: number = 10000

  userCourse: UserCourse = new UserCourse();
  displayModalUserCourseSave: boolean = false;
  userCourses: UserCourse[] = [];
  totalRegistrosUserCourses: number = 10000
  selectedUserCourse = new UserCourse();
  showConfirmRemoveUserCourseDialog: boolean = false;

  extension: any;

  interests: any[] = [];
  showInterestsDialog: boolean = false;
  showSelectInterestsDialog: boolean = false;

  showLoading: boolean = false;

  showConfirmDialog: boolean = false;
  showConfirmRemovePostDialog: boolean = false;

  selectedInterest: Interest = new Interest();

  selectedPost = new Post();

  selectedFriendToBeRemoved = new User();

  selectedInstitution?: number;
  courses: any[] = [];
  institutions: any[] = [];
  course = new Course();

  activeTabPost: number = 1;
  activeTabInfo: number = 1;

  filtro: IPostFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc'
  }

  filtroAmigos: IUserFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'firstName,asc',
  }

  filterUserCourses: UserCourseFilter = {
    page: 0,
    itemsPerPage: 20,
    sort: 'id,asc',
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private commentService: CommentService,
    private likeService: LikeService,
    private courseService: CourseService,
    private institutionService: InstitutionService,
    private errorHandler: ErrorHandlerService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private feedsService: FeedsService,
    private interestService: InterestService,
    private userCourseService: UserCourseService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    const userId = this.route.snapshot.params['userId'];
    if (userId) {
      this.getUserByUserId(userId);
    }
    this.getInterests();
    this.getInstitutions();
    this.scrollToTop();
  }

  seeProfileByUserId(userId: string){
    this.filtro.page = -1;
    this.filtroAmigos.page = -1;
    this.posts = [];
    this.friends = [];
    this.getUserByUserId(userId);
    this.scrollToTop();
    this.router.navigateByUrl('/user/profile/' + this.user.userId);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setActiveTabPost(tabIndex: number) {
    this.activeTabPost = tabIndex;
  }

  setActiveTabInfo(tabIndex: number) {
    this.activeTabInfo = tabIndex;
  }

  getUserByUserId(userId: string) {
    this.userService.getUserByUserId(userId).subscribe(
      (user: User) => {
        this.user = user;
        this.getUserPostsByUserId(user);
        this.getUserFriends(user);
        this.getUserCoursesByUser(user);
      },
      (erro) => this.errorHandler.handle(erro),
    );
  }

  update(userForm: NgForm) {
    this.userService.updateUserProfile(this.user).subscribe(
      (response) => {
        this.user = response;
        this.authenticationService.addUserToLocalCache(response);
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
        dados.content.forEach(post => {
          this.checkIfLiked(post);
          this.checkIfSaved(post);
          this.getNumberOfLikes(post);
          this.getNumberOfComments(post);
        });
        this.posts = [...this.posts, ...dados.content];
        this.totalRegistros = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getUserFriends(user: User): void {
    this.filtroAmigos.page++;
    this.userService.getUserFriends(user.id, this.filtroAmigos).subscribe(
      (dados: IApiResponse<User>) => {
        this.friends = [...this.friends, ...dados.content];
        this.totalRegistrosAmigos = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  removeFriend(friend: User) {
    this.userService.removeFriend(friend.id).subscribe(
      () => {
        // Remove o amigo da lista de amigos
        this.friends = this.friends.filter(existingFriend => existingFriend.id !== friend.id);
      },
      erro => this.errorHandler.handle(erro)
    )
  }

  onRemoveFriend(friend: User): void {
    this.showConfirmDialog = true;
    this.selectedFriendToBeRemoved = friend;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(friend: User) {
    this.removeFriend(friend);
    this.closeConfirmDialog();
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
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  onShowMorePosts() {
    this.getUserPostsByUserId(this.user);
  }

  onShowMoreFriends() {
    this.getUserFriends(this.user);
  }

  toggleLike(post: Post): void {
    this.likeService.toggleLike(post.id).subscribe(response => {
      post.isLiked = !post.isLiked;
      if (post.isLiked) {
        post.numberOfLikes = post.numberOfLikes + 1;
      } else {
        post.numberOfLikes = post.numberOfLikes - 1;
      }
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      });
  }

  checkIfLiked(post: Post): void {
    this.likeService.checkIfLiked(post.id).subscribe(response => {
      post.isLiked = response;
      console.log(response)
    }, error => {
      console.error('Erro ao verificar se o post foi curtido:', error);
    });
  }

  checkIfSaved(post: Post): void {
    this.userService.checkIfUserSavedPost(this.currentUser.id, post.id).subscribe(response => {
      post.isSaved = response;
    });
  }

  closePost(post: Post) {
    this.posts = this.posts.filter(p => p.id !== post.id);
  }

  getNumberOfLikes(post: Post): void {
    this.likeService.countLikesByPostId(post.id).subscribe((response: number) => {
      post.numberOfLikes = response;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getNumberOfComments(post: Post): void {
    this.commentService.countCommentsByPostId(post.id).subscribe((response: number) => {
      post.numberOfComments = response;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  addPostToSavedPosts(post: Post): void {
    this.userService.addPostToSavedPosts(this.currentUser.id, post.id).subscribe(() => {
      post.isSaved = true;
    });
  }

  removePostFromSavedPosts(post: Post): void {
    this.userService.removePostFromSavedPosts(this.currentUser.id, post.id).subscribe(() => {
      post.isSaved = false;
    });
  }

  onRemovePost(post: Post): void {
    this.showConfirmRemovePostDialog = true;
    this.selectedPost = post;
  }

  closeConfirmRemovePostDialog() {
    this.showConfirmRemovePostDialog = false;
  }

  confirmRemovePostDialog(post: Post) {
    this.removePostFromSavedPosts(post);
    this.closeConfirmRemovePostDialog();
  }
  
  onAddUserCourse(){
    this.userCourse = new UserCourse();
    this.displayModalUserCourseSave = true;
  }

  get editingUserCourse() {
    return Boolean(this.userCourse.id);
  }

  savedUserCourse(userForm: NgForm) {
    if (this.editingUserCourse) {
      this.updateUserCourse(userForm);
    } else {
      this.addCourseToUser(userForm);
    }
  }

  addCourseToUser(userForm: NgForm) {
    this.userCourse.user = this.currentUser;
    this.userCourseService.addCourseToUser(this.userCourse).subscribe(
      (response) => {
        this.userCourse = response;
        this.userCourse.startDate = new Date(this.userCourse.startDate);
        this.userCourses.push(this.userCourse);
        this.getUserCoursesByUser(this.currentUser);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  updateUserCourse(userForm: NgForm) {
    this.userCourse.user = this.currentUser;
    this.userCourseService.updateUserCourse(this.userCourse).subscribe(
      (response) => {
        this.userCourse = response;
        this.userCourse.startDate = new Date(this.userCourse.startDate);
        this.getUserCoursesByUser(this.userCourse.user);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  removeUserCourse(userCourse: UserCourse) {
    this.userCourseService.removeUserCourse(userCourse.id).subscribe(() => {
      this.userCourses = this.userCourses.filter(uc => uc.id !== userCourse.id);
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getUserCoursesByUser(user: User): void {
    this.userCourseService.getCoursesByUser(user.id, this.filterUserCourses).subscribe(
      (dados: IApiResponse<UserCourse>) => {
        this.userCourses = dados.content;
        this.totalRegistrosUserCourses = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getCoursesByInstitutionId() {
    this.courseService.getByInstitutionId(this.selectedInstitution!).then(lista => {
      this.courses = lista.map(course => ({
        label: course.name,
        value: course.id
      }));
    })
    .catch(erro => this.errorHandler.handle(erro));
  }

  getInstitutions() {
    return this.institutionService.listarTodos().subscribe(
      dados => {
        this.institutions = dados.content.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onEditUserCourse(userCourse: UserCourse): void {
    this.userCourse = userCourse;
    this.selectedInstitution = (this.userCourse.course.institution) ? this.userCourse.course.institution.id : undefined;
    if (this.selectedInstitution) {
      this.getCoursesByInstitutionId();
    }
    userCourse.startDate = new Date(userCourse.startDate);
    this.displayModalUserCourseSave = true;
  }

  toggleDropdown(userCourse: UserCourse) {
    userCourse.isAdminMenuOpen = !userCourse.isAdminMenuOpen
  }

  closeDropdown(userCourse: UserCourse) {
    userCourse.isAdminMenuOpen = false;
  }

  onRemoveUserCourse(userCourse: UserCourse): void {
    this.showConfirmRemoveUserCourseDialog = true;
    this.selectedUserCourse = userCourse;
  }

  closeConfirmRemoveUserCourseDialog() {
    this.showConfirmRemoveUserCourseDialog = false;
  }

  confirmRemoveUserCourseDialog(userCourse: UserCourse) {
    this.removeUserCourse(userCourse);
    this.closeConfirmRemoveUserCourseDialog();
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
