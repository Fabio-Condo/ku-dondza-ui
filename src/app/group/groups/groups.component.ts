import { Component, OnInit, ViewChild } from "@angular/core";
import { Group } from "src/app/core/model/Group";
import { GroupService } from "../groups.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { HttpErrorResponse } from "@angular/common/http";
import { GroupFilter } from "src/app/core/interface/GroupFilter";
import { IApiResponse } from "src/app/core/interface/IApiResponse";


@Component({
  selector: 'app-group',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  groups: Group[] = [];
  selectedGroup: Group = new Group();
  group: Group = new Group();
  file!: File;

  displayModalSave: boolean = false;
  showLoading: boolean = false;
  currentPage: number = 1;
  totalRegistros: number = 0
  totalGroups: number = 0;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  isAdmin: boolean = true;


  constructor(
    private groupService: GroupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    //this.getGroups();
    this.findAll(0);
    this.buscarTotal();
  }

  filtro: GroupFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc'
  }

  @ViewChild('tabela') grid: any;

  get editing() {
    return Boolean(this.group.id)
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
    this.groupService.update(this.group.id, this.group.description, this.file).subscribe(
      response => {
        this.group = response
        this.messageService.add({ severity: 'success', detail: 'Grupo actualizado com sucesso!' });
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
    this.groupService.save(this.group.description,  this.file).subscribe(
      response => {
        this.group = response
        this.messageService.add({ severity: 'success', detail: 'Grupo salvo com sucesso!' });
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
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.groupService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Group>) => {
        this.groups = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(group: Group) {
    this.groupService.excluir(group.id!).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Grupo excluído com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(group: Group): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(group);
      }
    });
  }

  buscarTotal() {
    this.showLoading = true;
    this.groupService.buscarTotal().subscribe(
      (total) => {
        this.totalGroups = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdate(id: number, description: string, file: File): void {
    this.group.id = id
    this.group.description = description;
    this.file = file;
    this.displayModalSave = true;
  }


  onAddNewGroup(): void {
    this.group = new Group();
    this.displayModalSave = true;
  }

  /*
  getGroups(): void {
    this.showLoading = true;
    this.groupService.getAllGroups().subscribe((data: Group[]) => {
      this.groups = data;
      this.showLoading = false;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  createGroup(): void {
    this.groupService.createGroup(this.newGroup).subscribe(group => {
      this.groups.push(group);
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  updateGroup(): void {
    if (this.selectedGroup && this.selectedGroup.id) {
      this.groupService.updateGroup(this.selectedGroup.id, this.selectedGroup).subscribe(updatedGroup => {
        this.groups = this.groups.map(group => group.id === updatedGroup.id ? updatedGroup : group);
      },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(errorResponse.error.message);
          this.showLoading = false;
        }
      );
    }
  }

  deleteGroup(id: number): void {
    this.groupService.deleteGroup(id).subscribe(() => {
      this.groups = this.groups.filter(group => group.id !== id);
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  selectGroup(group: Group): void {
    this.selectedGroup = { ...group };
  }

  cancelEdit(): void {
  }

  */

  changePageSize(event: any): void {
    this.filtro.itensPorPagina = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.findAll();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findAll();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findAll();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRegistros / this.filtro.itensPorPagina);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}

