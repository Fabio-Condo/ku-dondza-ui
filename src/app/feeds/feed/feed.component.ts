import { Component, HostListener, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  //npm install mime-types

  video: string = 'https://www.youtube.com/watch?v=Otr3Up8wRn0'

  subscriptions: Subscription[] = [];
  values: string[] = ['A','B','C','D'] ; //Depois eliminar

  imagePath = './assets/images'

  showLoading: boolean = false;

  feeds: Post[] = []; 
  post = new Post();
  postImage: any; 
  fileName: any; 

  displayModal: boolean = false;
  selectedPostModal = new Post();
  postId: number = 0;

  extension: any;

  constructor(
    private router: Router,
    private feedsService: FeedsService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    ) { }

  ngOnInit(): void {
    this.loadMore();
    this.video = 'https://www.youtube.com/watch?v=wVpXwNtIJL0'
  }

  totalRecords: number = 0

  filter: IPostFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc',
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadMore();
    }
  }

  loadMore(): void {
    this.filter.page++;
    this.feedsService.search(this.filter).subscribe(
      (data: IApiResponse<Post>) => {
        this.totalRecords = data.totalElements;    
        this.showLoading = false;
        this.feeds = [...this.feeds, ...data.content]; // Adicionar cada vez que se faz o load
        console.log('carregando dados')
      },
      (erro) => {
        this.errorHandler.handle(erro)
        this.showLoading = false;
      }
    );
  }

  onAddPostUser(postForm: NgForm): void {
    this.showLoading = true;
    const formData = this.feedsService.createPostFormDate(postForm.value, this.postImage);
    this.subscriptions.push(
      this.feedsService.addPost(formData).subscribe(
        (response: Post) => {
          this.post = response;
          this.fileName = null;
          this.postImage = null;
          this.messageService.add({ severity: 'success', detail: `Post added successfully`});
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(errorResponse.error.message);
          this.postImage = null;
          this.showLoading = false;
        }
      )
    );
  }

  onPostImageChange(fileName: any, postImage: any): void {    
    this.fileName =  fileName.target.files[0].name;
    this.postImage = postImage.target.files[0];
  }

  public onSelectPost(selectedPost: Post): void {
    this.selectedPostModal = selectedPost;
    this.displayModal = true;
  }

  isImageUrl(url: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    this.extension = url.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(this.extension);
  }
  
  isVideoUrl(url: string): boolean {
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
    this.extension = url.split('.').pop()?.toLowerCase();
    console.log(url);
    console.log(this.extension);
    return videoExtensions.includes(this.extension);
  }

  private sendNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }



}

