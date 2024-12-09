import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';
import { SearchResultDTO } from '../model/SearchResultDTO';
import { IApiResponse } from '../interface/IApiResponse';
import { SearchService } from 'src/app/search/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  imagePath = './assets/images';
  isUserLoggedIn: boolean = false;
  loggedUser: User = new User();
  searchQuery: string = '';
  results: SearchResultDTO[] = [];// Defina o tipo mais específico para os resultados

  constructor(
    private router: Router,
    private searchService: SearchService,  // Injete o serviço
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) { }

  isMenuActive = false; // Controla a exibição do menu

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
  }

  goToProfile() {
    this.router.navigate(['/user/profile', this.loggedUser.userId]);
  }

  onLogIn(): void {
    this.router.navigate(['/login']);
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  onSearchChange() {
    if (this.searchQuery.length > 2) {  // Fazer a busca apenas se a consulta for suficientemente longa
      this.loadPage(0);  // Começar a partir da primeira página
    }
  }

  loadPage(page: number) {
    this.searchService.search(this.searchQuery, page).subscribe(
      (results: IApiResponse<SearchResultDTO>) => {
        this.results = results.content;
      },
      error => {
        this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Erro ao realizar a busca'});
        console.error('Erro ao realizar a busca', error);
      }
    );
  }
}
