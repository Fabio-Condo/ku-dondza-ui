import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BlogLikeService } from 'src/app/core/likes copy/blog-like.service';
import { Blog } from 'src/app/core/model/Blog';
import { BlogService } from '../blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';

@Component({
  selector: 'app-view-blog',
  templateUrl: './view-blog.component.html',
  styleUrls: ['./view-blog.component.css']
})
export class ViewBlogComponent implements OnInit {

  blog: Blog = new Blog();
  selectedBlog = new Blog();
  showConfirmDialog: boolean = false;

  loggedUser: User = new User;


  constructor(
    private blogService: BlogService,
    private blogLikeService: BlogLikeService,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const blogId = this.route.snapshot.params['id'];
    if (blogId) {
      this.findById(blogId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  findById(id: string) {
    this.blogService.getBlogByBlogId(id).subscribe(
      (response) => {
        this.blog = response;
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  toggleLike(blog: Blog): void {
    this.blogLikeService.toggleLike(blog.id).subscribe(
      response => {
        blog.isLiked = !blog.isLiked;
        if (blog.isLiked) {
          blog.numberOfLikes = blog.numberOfLikes + 1;
        } else {
          blog.numberOfLikes = blog.numberOfLikes - 1;
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  addBlogToSavedBlogs(blog: Blog): void {
    this.userService.addBlogToSavedBlogs(this.loggedUser.id, blog.id).subscribe(() => {
      blog.isSaved = true;
    });
  }
  
  removeBlogFromSavedBlogs(blog: Blog): void {
    this.userService.removeBlogFromSavedBlogs(this.loggedUser.id, blog.id).subscribe(() => {
      blog.isSaved = false;
    });
  }

  onRemoveBlog(blog: Blog): void {
    this.showConfirmDialog = true;
    this.selectedBlog = blog;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(blog: Blog) {
    this.removeBlogFromSavedBlogs(blog);
    this.closeConfirmDialog();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
