import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { SearchResultDTO } from 'src/app/core/model/SearchResultDTO';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchQuery: string = '';
  results: SearchResultDTO[] = [];
  //searchQuery: string = ''; // Consulta do usuário
  //results: { type: string; id: number; urlFile?: string; content: string }[] = []; // Resultados simulados
  constructor(
    private searchService: SearchService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const query = this.route.snapshot.params['query'];
    this.searchQuery = query

    if (query) {
      this.searchQuery = query
      this.loadPage(0);
      console.log('query: ' + query);
    }
  }

  onSearchChange() {
    if (this.searchQuery.length > 2) {
      this.loadPage(0);
    }
  }

  loadPage(page: number) {
    this.searchService.search(this.searchQuery, page).subscribe(
      (results: IApiResponse<SearchResultDTO>) => {
        this.results = results.content;
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao realizar a busca' });
        console.error('Erro ao realizar a busca', error);
      }
    );
  }

  // Retorna apenas os usuários
  get userResults() {
    return this.results.filter(result => result.type === 'User');
  }

  // Retorna apenas os grupos
  get groupResults() {
    return this.results.filter(result => result.type === 'Group');
  }

  // Retorna apenas as instituições
  get institutionResults() {
    return this.results.filter(result => result.type === 'Institution');
  }
  
}
