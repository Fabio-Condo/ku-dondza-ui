import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { InstitutionFilter } from 'src/app/core/interface/InstitutionFilter';
import { Institution } from 'src/app/core/model/Institution';
import { InstitutionService } from '../InstitutionService.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.component.html',
  styleUrls: ['./institutions.component.css']
})
export class InstitutionsComponent implements OnInit {

  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0
  instutions: Institution[] = [];
  institution: Institution = new Institution;
  displayModalSave: boolean = false;
  totalInstitutions: number = 0;
  displayModalFilter: boolean = false;

  isAdmin: boolean = true;


  constructor(
    private institutionService: InstitutionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
    this.findAll();
  }

  @ViewChild('tabela') grid: any;

  filtro: InstitutionFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc'
  }

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = pagina;
    this.institutionService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Institution>) => {
        this.instutions = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  buscarTotal() {
    this.showLoading = true;
    this.institutionService.buscarTotal().subscribe(
      (total) => {
        this.totalInstitutions = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  onAddNewExame(): void {
    this.institution = new Institution();
    this.displayModalSave = true;
  }

  getAdministrationTypeValue(type: string) {
    switch (type) {
      case 'PUBLIC':
        return 'pública';
      case 'PRIVATE':
        return 'privada';
    }
    return '';
  }

  getAdministrationType(type: string) {
    switch (type) {
      case 'PUBLIC':
        return 'primmary';
      case 'PRIVATE':
        return 'info';
    }
    return '';
  }

  aoMudarPagina(event: LazyLoadEvent) {
    const pagina = event!.first! / event!.rows!;
    this.filtro.itensPorPagina = event!.rows!;
    this.findAll(pagina);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
