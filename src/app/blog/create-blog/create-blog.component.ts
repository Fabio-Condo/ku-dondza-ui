import { Component, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { Blog } from 'src/app/core/model/Blog';
import { HttpErrorResponse } from '@angular/common/http';
import { SubjectsService } from 'src/app/core/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.css']
})
export class CreateBlogComponent implements OnInit {

  blog: Blog = new Blog();
  subjects: Subject[] = [];
  showLoading: boolean = false;
  file!: File;

  constructor(
    private blogService: BlogService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.carregarDisciplinas();
    const blogId = this.route.snapshot.params['id'];
    if (blogId) {
      this.findById(blogId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.blog.id)
  }

  save() {
    if (this.editing) {
      this.update()
    } else {
      this.addNew()
    }
  }

  newBlog() {
    this.blog = new Blog();
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  update() {
    this.showLoading = true;
    this.blogService.update(this.blog, this.file).subscribe(
      response => {
        this.blog = response
        this.messageService.add({ severity: 'success', detail: 'Exame actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.blogService.save(this.blog, this.file).subscribe(
      response => {
        this.blog = response
        this.messageService.add({ severity: 'success', detail: 'Exame salvo com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
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

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados; 
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
