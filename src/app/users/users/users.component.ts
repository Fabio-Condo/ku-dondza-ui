import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { CustomHttpRespone } from 'src/app/core/model/custom-http-response';
import { User } from 'src/app/core/model/User';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  currentUser: User = new User(); // logged user

  //exbindoFormularioAddUser = false;
  //exbindoFormularioEditUser = false;
  exbindoFormularioSettingsUser = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  user: User = new User;
  showLoading: boolean = true;
  subscriptions: Subscription[] = [];
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  profileImageFile!: File;

  users: User[] = [];
  currentPage: number = 1;
  totalUsersRecord: number = 0
  totalUsers: number = 0;
  itemsPerPageUsers: number[] = [5, 10, 20, 50];

  activeTab: number = 3;

  filtro: IUserFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'fullName,asc',
  }

  userType = [
    { label: 'Estudante', value: 'STUDENT' },
    { label: 'Professor', value: 'TEACHER' },
    { label: 'Instrutor', value: 'INSTRUTOR' },
  ];

  roles = [
    { label: 'User', value: 'ROLE_USER' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Super admin', value: 'ROLE_SUPER_ADMIN' },
  ];

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private messageService: MessageService,
    private title: Title,
    private confirmationService: ConfirmationService,
    private errorHandler: ErrorHandlerService,
  ) {
  }

  ngOnInit(): void {
    this.title.setTitle('Pesquisa do usuário');
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    this.findAll(0);
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.user.id)
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
    this.userService.update(this.user, this.profileImageFile).subscribe(
      response => {
        this.user = response
        this.messageService.add({ severity: 'success', detail: 'User actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.userService.save(this.user, this.profileImageFile).subscribe(
      response => {
        this.user = response
        this.messageService.add({ severity: 'success', detail: 'User salvo com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onAddNewUser(): void {
    this.user = new User();
    this.displayModalSave = true;
  }

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  findAll(pagina: number = 0): void {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.userService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<User>) => {
        this.users = dados.content
        this.totalUsersRecord = dados.totalElements;
        if (this.totalUsers == 0) {
          this.totalUsers = dados.totalElements;
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  loadMore(page: number = 0): void {
    this.showLoading = true;
    this.filtro.page++;

    this.userService.findAll(this.filtro).subscribe(
      (data: IApiResponse<User>) => {
        this.users = [...this.users, ...data.content];

        this.totalUsersRecord = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onDeleteUder(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpRespone) => {
          this.messageService.add({ severity: 'success', detail: response.message });
          this.findAll();
        },
        (error: HttpErrorResponse) => {
          this.sendErrorNotification(error.error.message);
        }
      )
    );
  }

  confirmarExclusao(user: User): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.onDeleteUder(user.email);
      }
    });
  }

  onEditUser(user: User): void {
    this.user = user;
    this.displayModalSave = true;
  }

  toggleDropdown(user: User) {
    user.isAdminMenuOpen = !user.isAdminMenuOpen
  }

  closeDropdown(user: User) {
    user.isAdminMenuOpen = false;
  }

  onFileSelected(event: any) {
    this.profileImageFile = event.target.files[0];
  }

  getUserTypeValue(type: string) {
    switch (type) {
      case 'STUDENT':
        return 'Estudante';
      case 'INSTRUTOR':
        return 'Instrutor';
      case 'TEACHER':
        return 'Professor';
    }
    return '';
  }

  getUserRoleValue(role: string) {
    switch (role) {
      case 'ROLE_USER':
        return 'User';
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_SUPER_ADMIN':
        return 'Super Admin';
    }
    return '';
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.fullName = "";
    this.filtro.email = "";
    this.filtro.role = "";
    this.filtro.userType = undefined;
    this.filtro.page = 0;
    this.filtro.itemsPerPage = 10;
    this.filtro.sort = "id,desc"
    this.findAll();
  }

  changePageSize(event: any): void {
    this.filtro.itemsPerPage = +event.target.value;
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
    return Math.ceil(this.totalUsersRecord / this.filtro.itemsPerPage);
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
