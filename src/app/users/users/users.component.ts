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

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {

  exbindoFormularioAddUser = false;
  exbindoFormularioEditUser = false;
  exbindoFormularioSettingsUser = false;

  //private titleSubject = new BehaviorSubject<string>('Users');
  //public titleAction$ = this.titleSubject.asObservable();
  public users: User[] = [];
  public user: User = new User;
  public refreshing: boolean = true;
  public selectedUser: User = new User;
  public fileName: any;
  public profileImage: any;
  private subscriptions: Subscription[] = [];
  public editUser = new User();
  private currentUsername: string = '';

  selectedUserView: User | undefined;
  selectedUserModal: User = new User;
  displayModal: boolean = false;


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
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getUsers(true);
  }

  prepararNovoUser() {
    this.exbindoFormularioAddUser = true;
  }

  prepararUserSettings() {
    this.exbindoFormularioSettingsUser = true;
  }

  public changeTitle(title: string): void {
    //this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users = response;
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUserModal = selectedUser;
    this.displayModal = true;
  }

  onProfileImageChange(fileName: any, profileImage: any): void {
    this.fileName = fileName.target.files[0].name;
    this.profileImage = profileImage.target.files[0];
  }

  public onAddNewUser(userForm: NgForm): void {
    this.refreshing = true;
    const formData = this.userService.createUserFormDate(null, userForm.value, this.profileImage);
    this.subscriptions.push(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          this.exbindoFormularioAddUser = false;
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          userForm.reset();
          this.messageService.add({ severity: 'success', detail: `${response.firstName} ${response.lastName} added successfully` });
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(errorResponse.error.message);
          this.profileImage = null;
          this.refreshing = false;
        }
      )
    );
  }

  public onUpdateUser(): void {
    this.refreshing = true;
    const formData = this.userService.createUserFormDate(this.currentUsername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.exbindoFormularioEditUser = false;
          this.getUsers(false);
          this.fileName = null;
          this.profileImage = null;
          this.messageService.add({ severity: 'success', detail: `${response.firstName} ${response.lastName} updated successfully` });
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(errorResponse.error.message);
          this.profileImage = null;
          this.refreshing = false;
        }
      )
    );
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpRespone) => {
          this.messageService.add({ severity: 'success', detail: response.message });
          this.refreshing = false;
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(error.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    );
  }

  public onDeleteUder(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpRespone) => {
          this.messageService.add({ severity: 'success', detail: response.message });
          this.getUsers(false);
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

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.exbindoFormularioEditUser = true;
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
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

  private sendNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId)?.click();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changeStatusActive(user: User): void {
    const newStatus = !user.active;

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

}
