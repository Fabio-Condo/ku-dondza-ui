import { Component, OnInit, ViewChild } from '@angular/core';
import { TeacherService } from '../teacherService.service';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Teacher } from 'src/app/core/model/Teacher';
import { TeacherFilter } from 'src/app/core/interface/TeacherFilter';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {

  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0
  teachers: Teacher[] = [];
  teacher: Teacher = new Teacher;
  displayModalSave: boolean = false;
  totalTeachers: number = 0;
  displayModalFilter: boolean = false;

  isAdmin: boolean = true;

  imagePath = './assets/images'

  constructor(
    private teacherService: TeacherService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal()
  }

  @ViewChild('tabela') grid: any;

  filtro: TeacherFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc'
  }

  get editing() {
    return Boolean(this.teacher.id)
  }

  save(teacherForm: NgForm) {
    if (this.editing) {
      this.update(teacherForm)
    } else {
      this.addNew(teacherForm)
    }
  }

  addNew(teacherForm: NgForm) {
    this.showLoading = true;
    this.teacherService.add(this.teacher).subscribe(
      (response) => {
        this.teacher = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Courso adicionada com sucesso!' });
        this.findAll(0);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(teacherForm: NgForm) {
    this.showLoading = true;
    this.teacherService.update(this.teacher).subscribe(
      (response) => {
        this.teacher = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Courso alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = pagina;
    this.teacherService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Teacher>) => {
        this.teachers = dados.content
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
    this.teacherService.buscarTotal().subscribe(
      (total) => {
        this.totalTeachers = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  public onUpdateTeacher(teacher: Teacher): void {
    this.teacher = teacher
    this.teacher.id = teacher.id
    this.displayModalSave = true;
  }

  onAddNewCourse(): void {
    this.teacher = new Teacher();
    this.displayModalSave = true;
  }

  excluir(teacher: Teacher) {
    this.teacherService.excluir(teacher.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Courso excluído com sucesso!' })
      this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(teacher: Teacher): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(teacher);
      }
    });
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  aoMudarPagina(event: LazyLoadEvent) {
    const pagina = event!.first! / event!.rows!;
    this.filtro.itensPorPagina = event!.rows!;
    this.findAll(pagina);
  }

  limparCampos() {
    this.filtro.name = "";
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
