import { Component, OnInit, ViewChild } from '@angular/core';
import { TeacherService } from '../teacherService.service';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Teacher } from 'src/app/core/model/Teacher';
import { TeacherFilter } from 'src/app/core/interface/TeacherFilter';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { NgForm } from '@angular/forms';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';

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
  file!: File;
  totalTeachers: number = 0;
  displayModalFilter: boolean = false;
  displayModalTeacherSubjects: boolean = false;
  displayModalAddTeacherSubjects: boolean = false;
  selectedModalTeacher: Teacher = new Teacher();

  subject: Subject = new Subject();
  subjects: any[] = [];

  isAdmin: boolean = true;

  imagePath = './assets/images'

  constructor(
    private teacherService: TeacherService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
    this.carregarDisciplinas();
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

  save() {
    if (this.editing) {
      this.update()
    } else {
      this.addNew()
    }
  }

  update() {
    this.showLoading = true;
    this.teacherService.update(this.teacher.id, this.teacher.name, this.teacher.email, this.teacher.contactNumber, this.file).subscribe(
      response => {
        this.teacher = response
        this.messageService.add({ severity: 'success', detail: 'Explicador actualizado com sucesso!' });
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
    this.teacherService.save(this.teacher.name, this.teacher.email, this.teacher.contactNumber, this.file).subscribe(
      response => {
        this.teacher = response
        this.messageService.add({ severity: 'success', detail: 'Explicador salvo com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
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

  onUpdateTeacher(teacher: Teacher): void {
    this.teacher = teacher
    this.teacher.id = teacher.id
    this.displayModalSave = true;
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  onUpdate(id: number, name: string, email: string, contactNumber: string, file: File): void {
    this.teacher.id = id
    this.teacher.name = name;
    this.teacher.email = email;
    this.teacher.contactNumber = contactNumber;
    this.file = file;
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
      this.messageService.add({ severity: 'success', detail: 'Teacher excluído com sucesso!' })
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

  onEditSubject(teacher: Teacher): void {
    this.selectedModalTeacher = teacher;
    this.displayModalTeacherSubjects = true;
  }

  onAddSubject(teacher: Teacher): void {
    this.selectedModalTeacher = teacher;
    this.displayModalAddTeacherSubjects = true;
  }

  onRemoveSubjectFromList(teacherId: number, subjectId: number, index: number): void {
    this.showLoading = true;
    this.teacherService.removeSubjectFromTeacherSubjectsList(teacherId, subjectId).subscribe(
      (response) => {
        this.showLoading = false;
        this.selectedModalTeacher.subjects.splice(index, 1);
        this.messageService.add({ severity: 'success', detail: 'Disciplina excluída com sucesso!' })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onAddSubjectToList(teacherId: number, subjectId: number): void {
    this.showLoading = true;
    this.teacherService.addSubjectToTeacherSubjectsList(teacherId, subjectId).subscribe(
      (response) => {
        this.selectedModalTeacher.subjects = response.subjects
        //this.findAll();
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Disciplina adicionada com sucesso!' })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  //confirmSubject(frm: NgForm) {
  //  this.teacher.subjects[this.subjectIndex!] = this.cloneSubject(this.subject!);
    //this.showSubjectForm = false;
  //  frm.reset();
  //}

  //cloneSubject(subject: Subject): Subject {
  //  return new Subject(subject.id, subject.name);
  //}

  carregarDisciplinas() {
    return this.subjectsService.findAll().subscribe(
      dados => {
        this.subjects = dados.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusaoSubject(teacherId: number, subjectId: number, index: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.onRemoveSubjectFromList(teacherId, subjectId, index);
      }
    });
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
