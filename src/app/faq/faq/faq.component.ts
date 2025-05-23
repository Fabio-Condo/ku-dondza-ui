import { Component, OnInit } from '@angular/core';
import { FaqCategory } from '../FaqCategory';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  categories: FaqCategory[] = [
    {
      title: 'Quizzes Automáticos',
      items: [
        {
          question: 'Como criar um quiz automático?',
          answer: 'Para criar um quiz automático, selecione a disciplina, escolha os tópicos de interesse e defina o nível de dificuldade. O sistema gerará automaticamente questões baseadas nos exercícios cadastrados e suas configurações.',
          open: false
        },
        {
          question: 'Como funcionam as dicas durante o quiz?',
          answer: 'Durante o quiz, você pode solicitar dicas de resolução clicando no botão "Dica". As dicas são progressivas, oferecendo orientações sem revelar a resposta completa, ajudando no processo de aprendizagem.',
          open: false
        },
        {
          question: 'Como visualizar a correção e resolução?',
          answer: 'Após finalizar o quiz, você receberá a correção completa com a pontuação e poderá visualizar a resolução detalhada de cada questão, incluindo explicações passo a passo.',
          open: false
        }
      ]
    },
    {
      title: 'Biblioteca Digital',
      items: [
        {
          question: 'Como baixar livros da biblioteca?',
          answer: 'Acesse o módulo Biblioteca, utilize os filtros para encontrar o livro desejado e clique em "Download". Os livros ficam disponíveis em formato PDF para estudo offline.',
          open: false
        },
        {
          question: 'Posso ler os livros online?',
          answer: 'Sim! Além do download, você pode ler online através do nosso visualizador integrado, que oferece ferramentas de marcação e anotações.',
          open: false
        }
      ]
    },
    {
      title: 'Cursos em Vídeo',
      items: [
        {
          question: 'Como os cursos são organizados?',
          answer: 'Os cursos são organizados em módulos sequenciais. Cada módulo contém várias aulas em vídeo e, ao final, você encontrará exercícios para download e exercícios resolvidos para praticar o conteúdo aprendido.',
          open: false
        },
        {
          question: 'Como acessar os exercícios do módulo?',
          answer: 'Após assistir todas as aulas de um módulo, a seção de exercícios será desbloqueada. Você poderá baixar listas de exercícios para praticar e acessar as resoluções detalhadas.',
          open: false
        }
      ]
    },
    {
      title: 'Competições',
      items: [
        {
          question: 'Como participar das competições?',
          answer: 'Acesse o módulo Competições, escolha uma competição ativa e faça sua submissão respondendo aos quizzes. Cada usuário pode fazer apenas uma submissão por competição.',
          open: false
        },
        {
          question: 'Como funciona o ranking?',
          answer: 'O ranking é atualizado em tempo real baseado na pontuação e tempo de conclusão. Você pode acompanhar sua posição e ver os melhores colocados na tabela de classificação.',
          open: false
        }
      ]
    },
    {
      title: 'Exercícios Resolvidos',
      items: [
        {
          question: 'Como acessar exercícios resolvidos?',
          answer: 'No módulo Exercícios Resolvidos, você pode filtrar por disciplina e tópico. Cada exercício possui resolução completa com dicas de resolução e explicações detalhadas.',
          open: false
        },
        {
          question: 'Os exercícios aparecem nos quizzes?',
          answer: 'Sim! Os exercícios resolvidos alimentam o banco de questões dos quizzes automáticos e competições, garantindo conteúdo sempre atualizado e de qualidade.',
          open: false
        }
      ]
    },
    {
      title: 'Artigos Acadêmicos',
      items: [
        {
          question: 'Como ler e interagir com artigos?',
          answer: 'Selecione um artigo na biblioteca para leitura. Após ler, você pode dar like se achou interessante ou usar save para salvar em seus favoritos para consulta posterior.',
          open: false
        },
        {
          question: 'Como encontrar artigos salvos?',
          answer: 'Seus artigos salvos ficam na seção "Meus Favoritos" dentro do módulo de artigos, organizados por data de salvamento para fácil acesso.',
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
