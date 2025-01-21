import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlogService } from '../blog.service';
import { Blog } from 'src/app/core/model/Blog';
import { HttpErrorResponse } from '@angular/common/http';
import { SubjectsService } from 'src/app/core/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Editor } from 'tinymce'; // Importe o tipo Editor
declare const tinymce: any;

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.css'],
})
export class CreateBlogComponent implements OnInit, OnDestroy {
  blog: Blog = new Blog();
  subjects: Subject[] = [];
  showLoading: boolean = false;
  file!: File;
  isTinyMceInitialized: boolean = false; // Flag para verificar se o TinyMCE foi inicializado

  constructor(
    private blogService: BlogService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregarDisciplinas();
    const blogId = this.route.snapshot.params['id'];
    if (blogId) {
      this.findById(blogId);
    }
    this.scrollToTop();

    // Detecta mudanças na rota
    this.route.params.subscribe(() => {
      this.initializeTinyMCE();
    });
  }

  ngOnDestroy(): void {
    // Remove o TinyMCE ao destruir o componente
    if (tinymce.get('editor')) {
      tinymce.get('editor').remove();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.blog.id);
  }

  save() {
    if (this.editing) {
      this.update();
    } else {
      this.addNew();
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
      (response) => {
        this.blog = response;
        this.messageService.add({ severity: 'success', detail: 'Exame actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      },
    );
  }

  addNew() {
    this.showLoading = true;
    this.blogService.save(this.blog, this.file).subscribe(
      (response) => {
        this.blog = response;
        this.messageService.add({ severity: 'success', detail: 'Exame salvo com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      },
    );
  }

  findById(id: string) {
    this.blogService.getBlogByBlogId(id).subscribe(
      (response) => {
        this.blog = response;
        // Se o TinyMCE já estiver inicializado, defina o conteúdo diretamente
        if (this.isTinyMceInitialized) {
          tinymce.get('editor').setContent(this.blog.content || '');
        }
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      },
    );
  }

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      },
    });
  }

  initializeTinyMCE() {
    // Remove o TinyMCE existente, se houver
    if (tinymce.get('editor')) {
      tinymce.get('editor').remove();
    }

    // Inicializa o TinyMCE
    tinymce.init({
      selector: '#editor',
      height: 500,
      menubar: true,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
        'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
      ],
      toolbar:
        'undo redo | formatselect | bold italic backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | help',
      setup: (editor: Editor) => {
        editor.on('change', () => {
          this.blog.content = editor.getContent();
        });
      },
      init_instance_callback: (editor: Editor) => {
        this.isTinyMceInitialized = true; // Marca o TinyMCE como inicializado
        // Define o conteúdo do editor após a inicialização
        if (this.blog.content) {
          editor.setContent(this.blog.content);
        }
      },
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