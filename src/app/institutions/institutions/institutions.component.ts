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
  file!: File;
  totalInstitutions: number = 0;
  displayModalFilter: boolean = false;

  isAdmin: boolean = true;


  tiposAdministracao = [
    { label: 'Privada', value: 'PRIVATE' },
    { label: 'Pública', value: 'PUBLIC' }
  ];

  niveis = [
    { label: 'Ensino Superior', value: 'Ensino Superior' },
    { label: 'Ensino Técnico', value: 'Ensino Técnico' }
  ];

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

  get editing() {
    return Boolean(this.institution.id)
  }

  save() {
    if (this.editing) {
      this.update()
    } else {
      this.addNew()
    }
  }

  update() {
    this.showLoading = true;
    this.institutionService.update(this.institution.id, this.institution.name, this.institution.acronym, this.institution.type, this.institution.administrationType, this.institution.address, this.institution.description, this.institution.website, this.file).subscribe(
      response => {
        this.institution = response
        this.messageService.add({ severity: 'success', detail: 'Instituição actualizada com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.institutionService.save(this.institution.name, this.institution.acronym, this.institution.type, this.institution.administrationType, this.institution.address, this.institution.description, this.institution.website, this.file).subscribe(
      response => {
        this.institution = response
        this.messageService.add({ severity: 'success', detail: 'Instituição salva com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
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

  public onUpdateInstitution(id: number, name: string, acronym: string, type: string, administrationType: string, address: string, description: string, website: string, file: File): void {
    this.institution.id = id
    this.institution.name = name;
    this.institution.acronym = acronym;
    this.institution.type = type;
    this.institution.administrationType = administrationType;
    this.institution.address = address;
    this.institution.website = website;
    this.institution.description = description;
    this.file = file;
    this.displayModalSave = true;
  }

  onAddNewInstitution(): void {
    this.institution = new Institution();
    this.displayModalSave = true;
  }

  excluir(institution: Institution) {
    this.institutionService.excluir(institution.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Instituição excluída com sucesso!' })
      this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(institution: Institution): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(institution);
      }
    });
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

  limparCampos() {
    this.filtro.global = "";
    this.filtro.name = "";
    this.filtro.description = "";
    this.filtro.administrationType = "";
    this.filtro.type = "";
    this.filtro.pagina = 0;
    this.filtro.itensPorPagina = 10;
    this.filtro.ordenamento = "id,desc"
    this.findAll();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
