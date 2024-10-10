import { Component, OnInit, ViewChild } from '@angular/core';
import { Group } from 'src/app/core/model/Group';
import { Post } from 'src/app/core/model/Post';
import { GroupService } from '../groups.service';
import { FeedsService } from 'src/app/feeds/feeds.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IPostFilter } from 'src/app/core/interface/IPostFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { GroupFilter } from 'src/app/core/interface/GroupFilter';

@Component({
  selector: 'app-groups-view',
  templateUrl: './groups-view.component.html',
  styleUrls: ['./groups-view.component.css']
})
export class GroupsViewComponent implements OnInit {

  group: Group = new Group();
  feeds: Post[] = [];
  totalRegistros: number = 0
  showLoading: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  loggedUser: User = new User;
  selectedGroup = new Group();

  showConfirmDialog: boolean = false;

  members: User[] = [];


  constructor(
    private groupService: GroupService,
    private feedsService: FeedsService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getGroupById(id);
      this.findFeedsByGroupId(0, id);
    }
  }

  // Variável para controlar a aba ativa
  activeTab: number = 1;

  // Função para alterar a aba ativa
  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }
    
  @ViewChild('tabela') grid: any;
  
  filtro: IPostFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc',
  }

  flitroGrupo: GroupFilter = {
    pagina: -1,
    itensPorPagina: 5,
    ordenamento: 'id,desc',
  }

  getGroupById(id: number) {
    this.groupService.getGroupById(id).subscribe(
      (response) => {
        this.group = response;
        this.getGroupMembers(response);
        this.checkIfIsMember(this.group);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  findFeedsByGroupId(pagina: number = 0, groupId: number): void {
    this.showLoading = true;
    //this.filtro.pagina = pagina;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.feedsService.findByGroupId(groupId, this.filtro).subscribe(
      (dados: IApiResponse<Post>) => {
        this.feeds = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getGroupMembers(group: Group): void {
    this.filtro.page++;
    this.groupService.getGroupMembers(group.id, this.flitroGrupo).subscribe(
      (dados: IApiResponse<User>) => {
        this.members = [...this.members, ...dados.content];
        this.totalRegistros = dados.totalElements
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  checkIfIsMember(group: Group): void {
    this.groupService.doesUserMemberOfGroup(group.id, this.loggedUser.id).subscribe(response => {
      group.isMember = response;
    });
  }

  addMemberToGroup(group: Group): void {
    this.groupService.addMemberToGroup(group.id, this.loggedUser.id).subscribe(() => {
      group.isMember = true;
    });
  }

  removeMemberFromGroup(group: Group): void {
    this.groupService.removeMemberFromGroup(group.id, this.loggedUser.id).subscribe(() => {
      group.isMember = false;
    });
  }

  onRemoveMember(group: Group): void {
    this.showConfirmDialog = true;
    this.selectedGroup = group;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(group: Group) {
    this.removeMemberFromGroup(group);
    this.closeConfirmDialog();
  }

  changePageSize(event: any): void {
    this.filtro.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.findFeedsByGroupId(0, this.group.id);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findFeedsByGroupId(0, this.group.id);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findFeedsByGroupId(0, this.group.id);
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRegistros / this.filtro.itemsPerPage);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
