import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  expandedModule: number | null = 1;
  
  courseData = {
    title: "Design de Interfaces Modernas",
    description: "Aprenda a criar interfaces de usuário modernas, responsivas e acessíveis usando as mais recentes tecnologias e princípios de design.",
    author: {
      name: "Marina Silva",
      role: "UI/UX Designer Sênior",
      avatar: "assets/images/avatar.jpg"
    },
    prerequisites: [
      { name: "Conhecimentos básicos de HTML e CSS", type: "Recomendado" },
      { name: "Fundamentos de UX", type: "Obrigatório" },
      { name: "Noções de design gráfico", type: "Opcional" }
    ],
    modules: [
      {
        id: 1,
        title: "Fundamentos de Design UI/UX",
        lessons: [
          { id: 1, title: "Princípios de Design Centrado no Usuário", duration: "45 min" },
          { id: 2, title: "Teoria das Cores e Tipografia", duration: "55 min" },
          { id: 3, title: "Hierarquia Visual e Grid Systems", duration: "50 min" },
          { id: 4, title: "Acessibilidade em Interfaces", duration: "60 min" }
        ]
      },
      {
        id: 2,
        title: "Protótipos e Wireframes",
        lessons: [
          { id: 5, title: "Ferramentas de Prototipação", duration: "40 min" },
          { id: 6, title: "Do Wireframe ao Design Final", duration: "65 min" },
          { id: 7, title: "Técnicas de Micro-interações", duration: "35 min" }
        ]
      },
      {
        id: 3,
        title: "Implementação Front-end",
        lessons: [
          { id: 8, title: "HTML5 Semântico e CSS Avançado", duration: "70 min" },
          { id: 9, title: "Design Responsivo na Prática", duration: "55 min" },
          { id: 10, title: "Frameworks CSS Modernos", duration: "60 min" },
          { id: 11, title: "Animações e Transições", duration: "50 min" }
        ]
      }
    ],
    students: [
      { id: 1, name: "Carlos Mendes", progress: 85, avatar: "assets/images/student1.jpg" },
      { id: 2, name: "Juliana Alves", progress: 92, avatar: "assets/images/student2.jpg" },
      { id: 3, name: "Fernando Costa", progress: 67, avatar: "assets/images/student3.jpg" },
      { id: 4, name: "Ana Beatriz", progress: 78, avatar: "assets/images/student4.jpg" },
      { id: 5, name: "Roberto Gomes", progress: 45, avatar: "assets/images/student5.jpg" }
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }

  toggleModule(moduleId: number): void {
    this.expandedModule = this.expandedModule === moduleId ? null : moduleId;
  }
}