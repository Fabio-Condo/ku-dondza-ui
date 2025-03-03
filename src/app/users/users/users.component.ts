import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { User } from 'src/app/core/model/User';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CustomHttpRespone } from 'src/app/core/model/custom-http-response';
import { Role } from 'src/app/enum/role.enum';
import { Subscription } from 'rxjs';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {

  currentUser: User = new User(); // logged user

  //exbindoFormularioAddUser = false;
  //exbindoFormularioEditUser = false;
  exbindoFormularioSettingsUser = false;


  user: User = new User;
  showLoading: boolean = true;
  subscriptions: Subscription[] = [];
  displayModalSave: boolean = false;
  isDropdownOpen: boolean = false;
  profileImageFile!: File;

  users: User[] = [];
  currentPage: number = 1;
  totalUsersRecord: number = 0
  totalUsers: number = 0;
  itemsPerPageUsers: number[] = [5, 10, 20, 50];

  activeTab: number = 3;

  filtroUsers: IUserFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'firstName,asc',
  }

  userType = [
    { label: 'SIMPLE', value: 'SIMPLE' },
    { label: 'INSTRUTOR', value: 'INSTRUTOR' },
    { label: 'TEACHER', value: 'TEACHER' },
  ];

  roles = [
    { label: 'USER', value: 'ROLE_USER' },
    { label: 'ADMIN', value: 'ROLE_ADMIN' },
    { label: 'SUPER ADMIN', value: 'ROLE_SUPER_ADMIN' },
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
    this.getUsersSearch();
    this.getTotalUsers();
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

  onFileSelected(event: any) {
    this.profileImageFile = event.target.files[0];
  }

  getUsersSearch(pagina: number = 0) {
    this.showLoading = true;
    this.filtroUsers.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.userService.search(this.filtroUsers).subscribe(
      (data: IApiResponse<User>) => {
        data.content.forEach(user => {

        });
        this.users = data.content
        this.totalUsersRecord = data.totalElements;
        this.showLoading = false;
      },
      (erro) => {
        this.errorHandler.handle(erro);
        this.showLoading = false;
      }
    );
  }

  getTotalUsers() {
    this.showLoading = true;
    this.userService.getTotalUsers().subscribe(
      (total) => {
        this.totalUsers = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  toggleDropdown(user: User) {
    user.isAdminMenuOpen = !user.isAdminMenuOpen
  }

  closeDropdown(user: User) {
    user.isAdminMenuOpen = false;
  }

  onResetPassword(emailForm: NgForm): void {
    this.showLoading = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpRespone) => {
          this.messageService.add({ severity: 'success', detail: response.message });
          this.showLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(error.error.message);
          this.showLoading = false;
        },
        () => emailForm.reset()
      )
    );
  }

  onDeleteUder(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpRespone) => {
          this.messageService.add({ severity: 'success', detail: response.message });
          this.getUsersSearch();
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(error.error.message);
        }
      )
    );
  }

  confirmarExclusao(user: User): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.onDeleteUder(user.username);
      }
    });
  }

  onEditUser(user: User): void {
    this.user = user;
    this.displayModalSave = true;
  }

  changePageSize(event: any): void {
    this.filtroUsers.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.getUsersSearch();
  }

  // All users
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getUsersSearch();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.getUsersSearch();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalUsersRecord / this.filtroUsers.itemsPerPage);
  }

  prepararNovoUser() {
    this.user = new User();
    this.displayModalSave = true;
  }

  prepararUserSettings() {
    this.exbindoFormularioSettingsUser = true;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changeStatusActive(user: User): void {
    const newStatus = !user.active; 3

    this.userService.changeStatusActive(user.username, newStatus).subscribe(
      () => {
        const acao = newStatus ? 'active' : 'inactive';

        user.active = newStatus;
        this.messageService.add({ severity: 'success', detail: `User ${acao} with sucess!` });
      },
      erro => this.errorHandler.handle(erro)
    );
  }

  changeStatusNotLocked(user: User): void {
    const newStatus = !user.notLocked;
    this.userService.changeStatusNotLocked(user.username, newStatus).subscribe(
      () => {
        const acao = newStatus ? 'true' : 'false';
        user.notLocked = newStatus;
        this.messageService.add({ severity: 'success', detail: `User ${acao} with success!` });
      },
      erro => this.errorHandler.handle(erro)
    );
  }




















  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  getStatusValue(status: boolean) {
    switch (status) {
      case true:
        return 'Activo';
      case false:
        return 'Inactivo';
    }
    return '';
  }

  getStatus(status: boolean) {
    switch (status) {
      case true:
        return 'primmary';
      case false:
        return 'danger';
    }
    return '';
  }

  getNotLockedValue(status: boolean) {
    switch (status) {
      case true:
        return 'Sim';
      case false:
        return 'Não';
    }
    return '';
  }

  getNotLockedStatus(status: boolean) {
    switch (status) {
      case true:
        return 'primmary';
      case false:
        return 'danger';
    }
    return '';
  }

  getRoleValue(status: string) {
    switch (status) {
      case 'ROLE_SUPER_ADMIN':
        return 'Super admin';
      case 'ROLE_USER':
        return 'User';
      case 'ROLE_ADMIN':
        return 'Admin';
    }
    return '';
  }

  getRole(status: string) {
    switch (status) {
      case 'ROLE_SUPER_ADMIN':
        return 'primmary';
      case 'ROLE_ADMIN':
        return 'success';
      case 'ROLE_USER':
        return 'info';
    }
    return '';
  }

  get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
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
