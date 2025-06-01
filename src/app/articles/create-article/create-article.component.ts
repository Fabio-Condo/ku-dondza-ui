import { Component, OnInit } from '@angular/core';
import { Article } from 'src/app/core/model/Article';
import { ArticlesService } from '../articles.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Editor } from 'tinymce'; // Importe o tipo Editor
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
declare const tinymce: any;

@Component({
  selector: 'app-create-article',
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.css']
})
export class CreateArticleComponent implements OnInit {

  article: Article = new Article();
  showLoading: boolean = false;
  file!: File;
  isTinyMceInitialized: boolean = false; // Flag para verificar se o TinyMCE foi inicializado

  loggedUser: User = new User();

  categoryTypes = [
    { label: 'Matemática', value: 'MATH' },
    { label: 'Ciência', value: 'SCIENCE' },
    { label: 'História', value: 'HISTORY' },
    { label: 'Língua', value: 'LANGUAGE' },
    { label: 'Tecnologia', value: 'TECHNOLOGY' },
  ];

  constructor(
    private articleService: ArticlesService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const articleId = this.route.snapshot.params['id'];
    if (articleId) {
      if (articleId != 'new') {
        this.findById(articleId);
      }
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
    return Boolean(this.article.id);
  }

  save() {
    if (this.editing) {
      this.update();
    } else {
      this.addNew();
    }
  }

  newArticle() {
    this.article = new Article();
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  update() {
    this.showLoading = true;
    this.articleService.update(this.article, this.file).subscribe(
      (response) => {
        this.article = response;
        this.messageService.add({ severity: 'success', detail: 'Artigo actualizado com sucesso!' });
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
    this.articleService.save(this.article, this.file).subscribe(
      (response) => {
        this.article = response;
        this.messageService.add({ severity: 'success', detail: 'Artigo salvo com sucesso!' });
        this.router.navigate(['/articles/create', this.article.articleId]);
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      },
    );
  }

  findById(id: string) {
    this.articleService.getArticleByArticleId(id, this.loggedUser.id).subscribe(
      (response) => {
        this.article = response;
        // Se o TinyMCE já estiver inicializado, defina o conteúdo diretamente
        if (this.isTinyMceInitialized) {
          tinymce.get('editor').setContent(this.article.content || '');
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
          this.article.content = editor.getContent();
        });
      },
      init_instance_callback: (editor: Editor) => {
        this.isTinyMceInitialized = true; // Marca o TinyMCE como inicializado
        // Define o conteúdo do editor após a inicialização
        if (this.article.content) {
          editor.setContent(this.article.content);
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
