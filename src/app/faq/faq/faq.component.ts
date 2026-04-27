import { Component, OnInit } from '@angular/core';
import { FaqCategory } from '../FaqCategory';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  email: string = 'dikahub.education@gmail.com';

  constructor() { }

  ngOnInit(): void {
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  categories: FaqCategory[] = [
    {
      title: 'Exames Anteriores de Admissão',
      items: [
        {
          question: 'Posso resolver exames anteriores de admissão?',
          answer: 'Sim! Disponibilizamos exames anteriores organizados por ano e disciplina. Você pode resolver no formato original da prova para treinar exatamente como no dia oficial.',
          open: false
        },
        {
          question: 'As provas anteriores têm resolução detalhada?',
          answer: 'Sim. Cada questão possui resolução comentada passo a passo, explicando o raciocínio e os conceitos cobrados, para que você não apenas veja a resposta, mas entenda como resolver.',
          open: false
        },
        {
          question: 'Resolver exames anteriores realmente ajuda?',
          answer: 'Sim. Treinar com provas anteriores permite entender o padrão das perguntas, o nível de dificuldade e os temas mais cobrados, aumentando significativamente sua confiança e desempenho no exame.',
          open: false
        }
      ]
    },
    {
      title: 'Simulados e Quizzes Estratégicos',
      items: [
        {
          question: 'Como criar um simulado para o exame de admissão?',
          answer: 'Selecione a disciplina, escolha os tópicos e defina o nível de dificuldade. O sistema gera automaticamente um simulado baseado no padrão do exame, focando nos conteúdos mais cobrados.',
          open: false
        },
        {
          question: 'Como funcionam as dicas durante o simulado?',
          answer: 'Durante o simulado, você pode solicitar dicas progressivas que ajudam a direcionar o raciocínio sem revelar a resposta. Isso fortalece seu aprendizado e melhora seu desempenho real.',
          open: false
        },
        {
          question: 'Recebo análise de desempenho?',
          answer: 'Sim. Ao finalizar, você recebe correção completa, pontuação detalhada e análise dos seus pontos fortes e fracos, ajudando a focar exatamente onde precisa melhorar antes do exame.',
          open: false
        }
      ]
    },
    {
      title: 'Exercícios Resolvidos',
      items: [
        {
          question: 'Como acessar exercícios focados no exame?',
          answer: 'Você pode filtrar por disciplina e tópico. Os exercícios são organizados com foco nos conteúdos mais frequentes nos exames de admissão.',
          open: false
        },
        {
          question: 'Os exercícios aparecem nos simulados?',
          answer: 'Sim. Nosso banco de questões é constantemente atualizado e alimenta os simulados automáticos, garantindo treino estratégico e alinhado ao exame.',
          open: false
        }
      ]
    },
    {
      title: 'Ranking e Pontuação',
      items: [
        {
          question: 'Como são atribuídos os pontos no ranking?',
          answer: 'Os pontos são atribuídos apenas quando o estudante realiza um teste e obtém aprovação. Para passar no teste é necessário alcançar pelo menos 85% de acertos. A pontuação depende da percentagem final obtida.',
          open: false
        },
        {
          question: 'Como funciona a pontuação por percentagem?',
          answer: 'A pontuação é calculada com base no desempenho no teste: 100% de acertos = 40 pontos, entre 90% e 99% = 30 pontos, entre 85% e 89% = 20 pontos.',
          open: false
        },
        {
          question: 'O que acontece se eu tiver menos de 85%?',
          answer: 'Resultados abaixo de 85% não são considerados aprovados e não geram pontos no ranking.',
          open: false
        }
      ]
    },
    {
      title: 'Cursos',
      items: [
        {
          question: 'Os cursos ajudam na preparação para o exame?',
          answer: 'Sim. Os cursos são organizados por módulos focados nos conteúdos exigidos nos exames de admissão. Ao final de cada módulo, você pratica com exercícios direcionados.',
          open: false
        },
        {
          question: 'Posso revisar antes do exame?',
          answer: 'Sim. Você pode assistir às aulas quantas vezes quiser e revisar os pontos mais importantes antes da prova.',
          open: false
        }
      ]
    }
  ];

  toggleItem2(categoryIndex: number, itemIndex: number) {
    const item = this.categories[categoryIndex].items[itemIndex];
    item.open = !item.open;
  }

  toggleItem3(categoryIndex: number, itemIndex: number) {
    const items = this.categories[categoryIndex].items;
    items.forEach((item, index) => {
      item.open = index === itemIndex ? !item.open : false;
    });
  }

  toggleItem4(categoryIndex: number, itemIndex: number) {
    const clickedItem = this.categories[categoryIndex].items[itemIndex];

    // Fecha todos os itens de todas as categorias
    this.categories.forEach(category =>
      category.items.forEach(item => item.open = false)
    );

    // Abre o item clicado (se estava fechado antes)
    clickedItem.open = !clickedItem.open;
  }

  toggleItem(categoryIndex: number, itemIndex: number) {
    const clickedItem = this.categories[categoryIndex].items[itemIndex];
    const wasOpen = clickedItem.open;

    // Fecha todos os itens de todas as categorias
    this.categories.forEach(category =>
      category.items.forEach(item => item.open = false)
    );

    // Reabre o item clicado se ele estava fechado antes
    clickedItem.open = !wasOpen;
  }


}
