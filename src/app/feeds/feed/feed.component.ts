import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IPostFilter } from 'src/app/core/interface/IPostFilter';
import { Post } from 'src/app/core/model/Post';
import { FeedsService } from '../feeds.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Comment } from "src/app/core/model/Comment";
import { CommentService } from 'src/app/core/commets/commentService .service';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { LikeService } from 'src/app/core/likes/like.service';
import { UserService } from 'src/app/users/user.service';
import { Like } from 'src/app/core/model/Like';
import { LikeFilter } from 'src/app/core/interface/LikeFilter';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  showPostLikesDialog: boolean = false;
  showConfirmDialog: boolean = false;
  dialogTitle: string = 'Deseja remover o post';

  selectedPost = new Post();

  //npm install mime-types

  subscriptions: Subscription[] = [];

  imagePath = './assets/images'

  showLoading: boolean = false;
  showAddPostLoading: boolean = false;

  feeds: Post[] = [];
  post = new Post();
  postImage: any;
  fileName: any;

  displayModal: boolean = false;
  selectedPostModal = new Post();
  postId: number = 0;

  loggedUser: User = new User;

  extension: any;

  likes: Like[] = [];


  constructor(
    private router: Router,
    private feedsService: FeedsService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private commentService: CommentService,
    private likeService: LikeService,
    private userService: UserService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.loadMore();
    this.findLikesByPostId(0);
  }

  totalRecords: number = 0

  filter: IPostFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc',
  }

  likeFilter: LikeFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,desc',
  }

  findLikesByPostId(pagina: number = 0): void {
    this.showLoading = true;
    this.likeFilter.page = pagina;
    this.likeService.findLikesByPostId(1, this.likeFilter).subscribe(
      (dados: IApiResponse<Like>) => {
        this.likes = dados.content
        //this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadMore();
    }
  }

  loadMore(): void {
    this.showLoading = true;
    this.filter.page++;
    this.feedsService.search(this.filter).subscribe(
      (data: IApiResponse<Post>) => {
        this.totalRecords = data.totalElements;
        this.showLoading = false;
        data.content.forEach(post => {
          this.checkIfLiked(post);
          this.checkIfSaved(post);
          this.getNumberOfLikes(post);
          this.getNumberOfComments(post);
        });
        this.feeds = [...this.feeds, ...data.content]; // Adicionar cada vez que se faz o load
        console.log('carregando dados')
      },
      (erro) => {
        this.errorHandler.handle(erro)
        this.showLoading = false;
      }
    );
  }

  onAddPost(postForm: NgForm): void {
    this.showAddPostLoading = true;
    const formData = this.feedsService.createPostFormDate(postForm.value, this.postImage);
    this.subscriptions.push(
      this.feedsService.addPost(formData).subscribe(
        (response: Post) => {
          this.post = response;
          this.fileName = null;
          this.postImage = null;
          this.messageService.add({ severity: 'success', detail: `Post added successfully` });
          this.showAddPostLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(errorResponse.error.message);
          this.postImage = null;
          this.showAddPostLoading = false;
        }
      )
    );
  }

  onPostImageChange(fileName: any, postImage: any): void {
    this.fileName = fileName.target.files[0].name;
    this.postImage = postImage.target.files[0];
  }

  public onSelectPost(selectedPost: Post): void {
    this.selectedPostModal = selectedPost;
    this.displayModal = true;
  }

  toggleReplyForm(comment: Comment): void {
    comment.showReplyForm = !comment.showReplyForm;
    if (comment.showReplyForm) {
      comment.replyContent = '';
    }
  }

  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
  }

  toggleShowInputComment(post: Post): void {
    post.showInputComment = !post.showInputComment;
  }

  toggleLike(post: Post): void {
    this.likeService.toggleLike(post.id).subscribe(response => {
      post.isLiked = !post.isLiked;
      if (post.isLiked) {
        post.likes.push({ id: response.id, post: post, user: this.loggedUser });
        post.numberOfLikes = post.numberOfLikes + 1;
      } else {
        post.likes = post.likes.filter(like => like.user.id !== this.loggedUser.id);
        post.numberOfLikes = post.numberOfLikes - 1;
      }
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(errorResponse.error.message);
        this.postImage = null;
        this.showLoading = false;
      });
  }

  checkIfLiked(post: Post): void {
    this.likeService.checkIfLiked(post.id).subscribe(response => {
      post.isLiked = response;
    }, error => {
      console.error('Erro ao verificar se o post foi curtido:', error);
    });
  }

  createComment(post: Post, parentCommentId: number | null, content: string): void {
    post.numberOfComments = post.numberOfComments + 1;

    const newComment = new Comment();
    newComment.post = post;
    newComment.parentCommentId = parentCommentId;
    newComment.content = content;

    this.commentService.createComment(newComment).subscribe(comment => {
      const pst = this.feeds.find(p => p.id === post.id);
      if (post) {
        if (parentCommentId) {
          const parentComment = post.comments.find(c => c.id === parentCommentId);
          if (parentComment) {
            parentComment.replies.push(comment);
          }
        } else {
          post.comments.push(comment);
        }
      }
    });
  }

  createReplyComment(post: Post, parentCommentId: number | null, content: string): void {
    post.numberOfComments = post.numberOfComments + 1;
    this.commentService.createReplyComment(post.id, parentCommentId!, content).subscribe(comment => {
      const pst = this.feeds.find(p => p.id === post.id);
      if (pst) {
        if (parentCommentId) {
          const parentComment = this.findCommentById(pst.comments, parentCommentId);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(comment);
          }
        } else {
          pst.comments.push(comment);
        }
      }
    });
  }

  findCommentById(comments: Comment[], id: number): Comment | null {
    for (let comment of comments) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.replies) {
        const found = this.findCommentById(comment.replies, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  getNumberOfLikes(post: Post): void {
    this.likeService.countLikesByPostId(post.id).subscribe((response: number) => {
      post.numberOfLikes = response;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(errorResponse.error.message);
      }
    );
  }

  getNumberOfComments(post: Post): void {
    this.commentService.countCommentsByPostId(post.id).subscribe((response: number) => {
      post.numberOfComments = response;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(errorResponse.error.message);
      }
    );
  }

  verificarAutor(idPostUser: number, idReplyUserPost: number): string {
    return idPostUser === idReplyUserPost ? "Autor" : "";
  }

  checkIfSaved(post: Post): void {
    this.userService.doesUserSavedPost(this.loggedUser.id, post.id).subscribe(response => {
      post.isSaved = response;
    });
  }

  closePost(post: Post) {
    this.feeds = this.feeds.filter(p => p.id !== post.id);
  }

  onClosePost(post: Post) {
    this.showConfirmDialog = true;
  }

  addPostToSavedPosts(post: Post): void {
    this.userService.addPostToSavedPosts(this.loggedUser.id, post.id).subscribe(() => {
      post.isSaved = true;
    });
  }

  onRemovePost(post: Post): void {
    this.showConfirmDialog = true;
    this.selectedPost = post;
  }

  removePostFromSavedPosts(post: Post): void {
    this.userService.removePostFromSavedPosts(this.loggedUser.id, post.id).subscribe(() => {
      post.isSaved = false;
    });
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(post: Post) {
    this.removePostFromSavedPosts(post);
    this.closeConfirmDialog();
  }

  onShowPostLikes(){
    this.showPostLikesDialog = true;
  }

  onClosePostLikes(){
    this.showPostLikesDialog = false;
  }

  isImageUrl(url: string): boolean {
    if (!url) return false; // Verifica se a URL é válida
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    this.extension = url.split('.').pop()?.toLowerCase();
    console.log(this.extension);
    return imageExtensions.includes(this.extension);
  }

  isVideoUrl(url: string): boolean {
    if (!url) return false; // Verifica se a URL é válida
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
    this.extension = url.split('.').pop()?.toLowerCase();
    console.log(this.extension);
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

  private sendNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}

