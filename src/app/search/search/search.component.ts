import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private searchService: SearchService,  
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.searchQuery = 'fabio'
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
        this.messageService.add({severity: 'error', summary: 'Erro', detail: 'Erro ao realizar a busca'});
        console.error('Erro ao realizar a busca', error);
      }
    );
  }
}
