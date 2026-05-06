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
          question: 'Qual a diferença entre praticar e fazer testes?',
          answer: 'A prática serve para aprender e compreender os conteúdos sem pressão e sem pontuação. Já os testes são avaliações finais onde o teu desempenho é medido e pode gerar pontos no ranking.',
          open: false
        },
        {
          question: 'A prática conta para o ranking?',
          answer: 'Não. Apenas testes finais aprovados (com pelo menos 80% de acertos) geram pontos no ranking. A prática é apenas para estudo e preparação.',
          open: false
        },
        {
          question: 'Como são atribuídos os pontos nos testes?',
          answer: 'Os pontos são atribuídos apenas em testes finais aprovados. Para ser aprovado é necessário atingir pelo menos 80% de acertos e cada resposta correta vale 10 pontos.',
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
          answer: 'Os pontos são atribuídos apenas quando o estudante realiza um teste e obtém aprovação. Para passar no teste é necessário alcançar pelo menos 80% de acertos.',
          open: false
        },
        {
          question: 'Como funciona a pontuação?',
          answer: 'Após atingir os 80% mínimos para aprovação, cada resposta correta vale 10 pontos. Quanto mais questões acertar, maior será a sua pontuação no ranking.',
          open: false
        },
        {
          question: 'Exemplo de pontuação',
          answer: 'Se você acertar 8 questões recebe 80 pontos, 9 questões recebe 90 pontos e 10 questões recebe 100 pontos, desde que atinja o mínimo de 80% para aprovação.',
          open: false
        },
        {
          question: 'O que acontece se eu tiver menos de 80%?',
          answer: 'Resultados abaixo de 80% não são considerados aprovados e não geram pontos no ranking.',
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
