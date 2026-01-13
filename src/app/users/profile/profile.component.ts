import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Role } from 'src/app/enum/role.enum';
import { Title } from '@angular/platform-browser';
import { Wallet } from 'src/app/core/model/Wallet';
import { WalletService } from 'src/app/core/wallets/answers.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User = new User();
  currentUser: User = new User();
  isUserLoggedIn: boolean = false;

  displayModalSave: boolean = false;

  selectedInterest: Subject = new Subject();
  subjectsInterests: Subject[] = [];

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  fileToUpload!: File;
  coverFileToUpload!: File;

  activeTab: string = 'activity';

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  //displayModalQuestionsList: boolean = false;
  //displayModalUpgradePlan: boolean = false;
  //displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private walletService: WalletService,
    private errorHandler: ErrorHandlerService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private subjectsService: SubjectsService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Profile user page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.currentUser = this.authenticationService.getUserFromLocalCache();
    const userId = this.route.snapshot.params['userId'];
    if (userId) {
      this.getUserByUserId(userId);
    }
    //this.getSubjectsInterests();
    this.scrollToTop();
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getSubjectsInterests() {
    this.loadingMessage = "Carregando disciplinas"
    this.showLoading = true;
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjectsInterests = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  getUserByUserId(userId: string) {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.userService.getUserByUserId(userId).subscribe(
      (user: User) => {
        this.user = user;
        this.showLoading = false;
        this.getWalletsByUser(this.user.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  update(userForm: NgForm) {
    this.showLoading = true;
    this.userService.updateUserProfile(this.user).subscribe(
      (response) => {
        this.user = response;
        this.authenticationService.addUserToLocalCache(response);
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onUpdateCurrentUser(): void {
    this.displayModalSave = true;
  }

  onProfilePhotoFileChange(event: any) {
    console.log('Clicking here 1');
    if (event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];

      this.userService.updateProfilePhoto(this.currentUser.email, this.fileToUpload).subscribe(
        response => {
          this.user = response;
          this.authenticationService.addUserToLocalCache(response);
        },
        error => {
          console.error('Upload failed', error);
        }
      );
    }
  }

  removeInterest(interest: { name: string }) {
    this.user.subjectsInterests = this.user.subjectsInterests.filter(i => i !== interest);
  }

  getWalletsByUser(userId: number): void {
    this.loadingMessage = "Obtendo dados"
    this.showLoading = true;
    this.walletService.getWalletsByUser(userId).subscribe(
      (dados: Wallet[]) => {
        this.userWallets = dados;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  setDefaultWallet(wallet: Wallet) {

    if (!wallet.id) {
      this.sendErrorNotification('Carteira inválida: ID não definido');
      return;
    }

    this.userWallets.forEach(w => w.default = false); // limpa anterior
    wallet.default = true;

    this.walletService.setDefault(wallet.id).subscribe({
      next: (updatedWallet) => {
        // Atualiza visualmente todas as carteiras
        this.userWallets.forEach(w => w.default = w.id === updatedWallet.id);
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  addNewWlletType(walletTypeForm: NgForm) {

    //this.wallet.user = this.loggedUser;

    this.detectWalletType(); // força atualização e validação

    const phone = this.wallet.phoneNumber || '';

    if (!this.wallet.type) {
      this.sendErrorNotification("Número inválido: prefixo deve ser 84, 85, 86 ou 87.");
      return;
    }

    if (phone.length !== 9) {
      this.sendErrorNotification("Número inválido: deve conter exatamente 9 dígitos.");
      return;
    }

    // Evitar duplicados
    const exists = this.userWallets.some(
      w => w.phoneNumber === phone
    );

    if (exists) {
      this.sendErrorNotification("Este número já está registado nas suas carteiras.");
      return;
    }

    // Definir como default se for a primeira carteira
    if (this.userWallets.length === 0) {
      this.wallet.default = true;
    } else {
      this.wallet.default = false;
    }

    this.loadingMessage = "Adicionando carteira"
    this.showLoading = true;
    this.walletService.add(this.user.id, this.wallet).subscribe(
      (response) => {
        console.log(response);
        this.wallet = response;

        this.userWallets.push(this.wallet);
        this.showLoading = false;
        this.displayModalAddPaymentOption = false;
        //this.messageService.add({ severity: 'success', detail: 'Disciplina adicionada com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  openModalAddPaymentOption() {
    this.displayModalAddPaymentOption = true;
  }

  onCloseModalAddPaymentOption() {
    this.displayModalAddPaymentOption = false;
  }

  detectWalletType(): void {
    const phone = this.wallet.phoneNumber ? this.wallet.phoneNumber.trim() : '';

    // Remove espaços e caracteres não numéricos
    const digitsOnly = phone.replace(/\D/g, '');

    // Define o telefone limpo
    this.wallet.phoneNumber = digitsOnly;

    // Validação do tamanho
    if (digitsOnly.length !== 9) {
      this.wallet.type = '';
      return;
    }

    // Verificação de prefixos válidos
    const prefix = digitsOnly.substring(0, 2);
    if (prefix === '84' || prefix === '85') {
      this.wallet.type = 'MPESA';
    } else if (prefix === '86' || prefix === '87') {
      this.wallet.type = 'EMOLA';
    } else {
      this.wallet.type = '';
    }
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.authenticationService.notifyLoginStatus(false);
    this.router.navigate(['/home']);
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
