import { Component, OnInit, ViewChild } from "@angular/core";
import { Group } from "src/app/core/model/Group";
import { GroupService } from "../groups.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { HttpErrorResponse } from "@angular/common/http";
import { GroupFilter } from "src/app/core/interface/GroupFilter";
import { IApiResponse } from "src/app/core/interface/IApiResponse";
import { User } from "src/app/core/model/User";
import { AuthenticationService } from "src/app/users/authentication.service";
import { UserService } from "src/app/users/user.service";


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
  isDropdownOpen: boolean = false;
  showLoading: boolean = false;

  currentPage: number = 1;
  totalRegistros: number = 0
  totalGroups: number = 0;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  isAdmin: boolean = false;
  activeTab: number = 2;

  currentUserGroups: Group[] = [];
  currentPageCurrentUserGroups: number = 1;
  totalRegistrosCurrentUserGroups: number = 0
  totalGroupsCurrentUserGroups: number = 0;
  opcoesItensPorPaginaCurrentUserGroups: number[] = [5, 10, 20, 50];

  loggedUser: User = new User;

  @ViewChild('tabela') grid: any;

  filtro: GroupFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  }

  filtroCurrentUserGroups: GroupFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  }

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll(0);
    this.getCurrentUserGroupsByUserId(0);
    this.countCurrentUserGroupsByUserId();
    this.buscarTotal();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
    this.groupService.update(this.group.id, this.group.name, this.group.description, this.file).subscribe(
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
    this.groupService.save(this.group.name, this.group.description,  this.file).subscribe(
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
        dados.content.forEach(group => {
          this.checkMembership(group);
          this.countMembersByGroupId(group);
        });
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getCurrentUserGroupsByUserId(pagina: number = 0): void {
    this.filtroCurrentUserGroups.pagina = this.currentPageCurrentUserGroups - 1; // Ajuste para o padrão de paginação começando em 0
    this.userService.getGroupsByUserId(this.loggedUser.id, this.filtroCurrentUserGroups).subscribe(
      (dados: IApiResponse<Group>) => {
        this.currentUserGroups = dados.content
        this.totalRegistrosCurrentUserGroups = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  countCurrentUserGroupsByUserId() {
    this.userService.countGroupsByUserId(this.loggedUser.id).subscribe(
      (total) => {
        this.totalGroupsCurrentUserGroups = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
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

  toggleDropdown(group: Group) {
    group.isAdminMenuOpen = !group.isAdminMenuOpen
  }

  closeDropdown(group: Group) {
    group.isAdminMenuOpen = false;
  }

  buscarTotal() {
    this.groupService.buscarTotal().subscribe(
      (total) => {
        this.totalGroups = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  checkMembership(group: Group): void {
    this.groupService.checkMembership(group.id, this.loggedUser.id).subscribe(response => {
      group.isCurrentUserMember = response;
    });
  }

  countMembersByGroupId(group: Group) {
    this.showLoading = true;
    this.groupService.countMembersByGroupId(group.id,).subscribe(
      (total) => {
        group.totalMembers = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdate(id: number, name: string, description: string, file: File): void {
    this.group.id = id;
    this.group.name = name;
    this.group.description = description;
    this.file = file;
    this.displayModalSave = true;
  }

  onAddNewGroup(): void {
    this.group = new Group();
    this.displayModalSave = true;
  }

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

  // Current User Groups
  changePageSizeCurrentUserGroups(event: any): void {
    this.filtroCurrentUserGroups.itensPorPagina = +event.target.value;
    this.currentPageCurrentUserGroups = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.getCurrentUserGroupsByUserId();
  }

  previousPageCurrentUserGroups(): void {
    if (this.currentPageCurrentUserGroups > 1) {
      this.currentPageCurrentUserGroups--;
      this.getCurrentUserGroupsByUserId();
    }
  }

  nextPageCurrentUserGroups(): void {
    if (this.currentPageCurrentUserGroups < this.totalPagesCurrentUserGroups()) {
      this.currentPageCurrentUserGroups++;
      this.getCurrentUserGroupsByUserId();
    }
  }

  totalPagesCurrentUserGroups(): number {
    return Math.ceil(this.totalRegistrosCurrentUserGroups / this.filtroCurrentUserGroups.itensPorPagina);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}