import { Component, OnInit, ViewChild } from '@angular/core';
import { Group } from 'src/app/core/model/Group';
import { Post } from 'src/app/core/model/Post';
import { GroupService } from '../groups.service';
import { FeedsService } from 'src/app/feeds/feeds.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IPostFilter } from 'src/app/core/interface/IPostFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { GroupFilter } from 'src/app/core/interface/GroupFilter';
import { CommentService } from 'src/app/core/commets/commentService .service';
import { LikeService } from 'src/app/core/likes/like.service';
import { CommentLikeService } from 'src/app/core/comment-likes/comment-like-service.service';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-groups-view',
  templateUrl: './groups-view.component.html',
  styleUrls: ['./groups-view.component.css']
})
export class GroupsViewComponent implements OnInit {

  group: Group = new Group();
  feeds: Post[] = [];
  totalRegistros: number = 0
  showLoading: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  loggedUser: User = new User;
  selectedGroup = new Group();

  showConfirmDialog: boolean = false;

  members: User[] = [];

  selectedPost = new Post();
  showConfirmDialogRemovePost: boolean = false;
  showInputPost: boolean = false;


  extension: any;


  constructor(
    private groupService: GroupService,
    private feedsService: FeedsService,
    private commentService: CommentService,
    private likeService: LikeService,
    private commentLikeService: CommentLikeService,
    private userService: UserService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getGroupById(id);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Variável para controlar a aba ativa
  activeTab: number = 1;

  // Função para alterar a aba ativa
  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  @ViewChild('tabela') grid: any;

  filtro: IPostFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc',
  }

  flitroGrupo: GroupFilter = {
    pagina: -1,
    itensPorPagina: 2,
    ordenamento: 'id,desc',
  }

  getGroupById(id: number) {
    this.groupService.getGroupById(id).subscribe(
      (response) => {
        this.group = response;
        this.getGroupMembers(this.group);
        this.getFeeds(this.group);
        this.checkMembership(this.group);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getFeeds(group: Group): void {
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.feedsService.findByGroupId(group.id, this.filtro).subscribe(
      (dados: IApiResponse<Post>) => {
        this.feeds = dados.content;
        dados.content.forEach(post => {
          this.checkIfLiked(post);
          this.checkIfSaved(post);
          this.getNumberOfLikes(post);
          this.getNumberOfComments(post);
        });
        this.totalRegistros = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
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
    this.userService.checkIfUserSavedPost(this.loggedUser.id, post.id).subscribe(response => {
      post.isSaved = response;
    });
  }

  addPostToSavedPosts(post: Post): void {
    this.userService.addPostToSavedPosts(this.loggedUser.id, post.id).subscribe(() => {
      post.isSaved = true;
    });
  }

  onRemovePost(post: Post): void {
    this.showConfirmDialogRemovePost = true;
    this.selectedPost = post;
  }

  removePostFromSavedPosts(post: Post): void {
    this.userService.removePostFromSavedPosts(this.loggedUser.id, post.id).subscribe(() => {
      post.isSaved = false;
    });
  }

  closeConfirmDialogRemovePost() {
    this.showConfirmDialogRemovePost = false;
  }

  confirmDialogRemovePost(post: Post) {
    this.removePostFromSavedPosts(post);
    this.closeConfirmDialogRemovePost();
  }

  onCreatePost(){
    this.showInputPost = true;
  }

  closeCreatePost(){
    this.showInputPost = false;
  }

  getGroupMembers(group: Group): void {
    this.flitroGrupo.pagina++;
    this.groupService.getGroupMembers(group.id, this.flitroGrupo).subscribe(
      (dados: IApiResponse<User>) => {
        this.members = [...this.members, ...dados.content];
        this.totalRegistros = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  onShowMoreMembers(): void {
    //const id = this.route.snapshot.params['id'];
    this.getGroupMembers(this.group);
  }

  onShowMoreFeeds(): void {
    this.getFeeds(this.group);
  }

  checkMembership(group: Group): void {
    this.groupService.checkMembership(group.id, this.loggedUser.id).subscribe(response => {
      group.isMember = response;
    });
  }

  addMemberToGroup(group: Group): void {
    this.groupService.addMemberToGroup(group.id, this.loggedUser.id).subscribe(() => {
      group.isMember = true;
    });
  }

  removeMemberFromGroup(group: Group): void {
    this.groupService.removeMemberFromGroup(group.id, this.loggedUser.id).subscribe(() => {
      group.isMember = false;
    });
  }

  onRemoveMember(group: Group): void {
    this.showConfirmDialog = true;
    this.selectedGroup = group;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(group: Group) {
    this.removeMemberFromGroup(group);
    this.closeConfirmDialog();
  }

  changePageSize(event: any): void {
    this.filtro.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.getFeeds(this.group);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getFeeds(this.group);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.getFeeds(this.group);
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRegistros / this.filtro.itemsPerPage);
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
