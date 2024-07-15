import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { UserFilter } from 'src/app/core/interface/UserFilter';
import { Post } from 'src/app/core/model/Post';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-saved-feed',
  templateUrl: './saved-feed.component.html',
  styleUrls: ['./saved-feed.component.css']
})
export class SavedFeedComponent implements OnInit {

  posts: Post[] = [];
  loggedUser: User = new User;
  showLoading: boolean = false;
  totalRegistros: number = 9
  currentPage: number = 1;

  // Opções de número de itens por página
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  extension: any;


  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private authenticationService: AuthenticationService,


  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.getSavedPosts(0);
  }

  @ViewChild('tabela') grid: any;

  filtro: UserFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  }


  getSavedPosts(pagina: number = 0): void {
    this.showLoading = true;
    //this.filtro.pagina = pagina;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0

    this.userService.getSavedPosts(this.loggedUser.id, this.filtro).subscribe(
      (dados: IApiResponse<Post>) => {
        this.posts = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  removePostFromSavedPosts(post: Post): void {
    this.userService.removePostFromSavedPosts(this.loggedUser.id, post.id).subscribe(() => {
      this.posts = this.posts.filter(p => p.id !== post.id);
    });
  }

  changePageSize(event: any): void {
    this.filtro.itensPorPagina = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.getSavedPosts();
  }


  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getSavedPosts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.getSavedPosts();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRegistros / this.filtro.itensPorPagina);
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
