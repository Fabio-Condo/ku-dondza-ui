import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

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
    sort: 'fullName,asc',
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
