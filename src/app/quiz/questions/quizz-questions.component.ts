import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { Answer } from 'src/app/core/model/Answer';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Topic } from 'src/app/core/model/Topic';
declare const MathJax: any;
import { evaluate } from 'mathjs'; //npm install mathjs


@Component({
  selector: 'app-quizz-questions',
  templateUrl: './quizz-questions.component.html',
  styleUrls: ['./quizz-questions.component.css'],
})
export class QuizzQuestionsComponent implements OnInit {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  topics: Topic[] = [];

  //selectedTopics: Topic[] = [];
  submittedAnswers: Answer[] = [];
  showLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    nullAnswers: number; // Nova propriedade para respostas nulas
  } = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };

  showCorrection: boolean = false;
  showStartScreen: boolean = true;

  imagePath = './assets/images/funcao do grau 2.png';

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc',
  };

  constructor(
    private quizService: QuizService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const quizId = this.route.snapshot.params['id'];
    if (quizId) {
      this.getQuizByQuizId(quizId);
      console.log('MathJax carregado:', typeof MathJax !== 'undefined');
    }
    this.scrollToTop();
    this.showCorrection = true;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getQuizByQuizId(quizId: string) {
    this.quizService.getQuizByQuizId(quizId).subscribe(
      (response) => {
        this.quiz = response;
        this.getQuestionsByQuizId(this.quiz.id);
        this.getUserSubmittedAnswersByQuizId(this.quiz.id);
        this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuestionsByQuizId(quizId: number): void {
    this.showLoading = true;
    this.quizService.getQuestionsByQuizId(quizId).subscribe(
      (dados: Question[]) => {
        this.questions = dados;
        this.quiz.questions = this.questions;
        this.showLoading = false;
        this.topics = this.getTopicosFromQuestoes(dados);
        // Recalcula os resultados após carregar as questões
        if (this.quiz.answers) {
          this.calculateResults();
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getTopicosFromQuestoes(questoes: Question[]): Topic[] {
    if (!questoes || questoes.length === 0) {
      console.error('Nenhuma questão recebida ou questões vazias');
      return [];
    }

    const topicosMap = new Map<number, Topic>();

    questoes.forEach((questao) => {
      if (questao.topic) {
        console.log(`Processando questão: ${questao.id}, tópico: ${questao.topic.name}`);
        if (!topicosMap.has(questao.topic.id)) {
          topicosMap.set(questao.topic.id, questao.topic);
        }
      } else {
        console.error(`Questão ${questao.id} sem tópico`);
      }
    });

    return Array.from(topicosMap.values());
  }

  getUserSubmittedAnswersByQuizId(quizId: number): void {
    this.showLoading = true;
    this.quizService.getUserSubmittedAnswersByQuizId(quizId).subscribe(
      (dados: Answer[]) => {
        this.submittedAnswers = dados;
        this.quiz.answers = this.submittedAnswers; // Atualiza as respostas do quiz
        this.showLoading = false;

        // Recalcula os resultados após carregar as respostas
        if (this.quiz.questions) {
          this.calculateResults();
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  /*
  calculateResults2(): void {

    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0; 

    this.quiz.questions.forEach((question) => {
      const submittedAnswer = this.quiz.userSubmittedAnswers.find(
        (a) => a.question.id === question.id
      );

      if (submittedAnswer) {
        if (submittedAnswer.correct) {

          this.result.correctAnswers++;
        } else {
          this.result.incorrectAnswers++;
        }
      } else {

        this.result.nullAnswers++;
      }
    });
  }
  */

  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0;

    // Reinicia o objeto de resultados por tópico
    this.quiz.resultsByTopic = {};

    // Itera sobre todas as questões do quiz
    this.quiz.questions.forEach((question) => {
      const submittedAnswer = this.quiz.answers.find(
        (a) => a.question.id === question.id
      );

      // Obtém o tópico da questão
      const questionTopic = question.topic?.name || 'Sem tópico';

      // Inicializa o tópico no objeto resultsByTopic, se necessário
      if (!this.quiz.resultsByTopic[questionTopic]) {
        this.quiz.resultsByTopic[questionTopic] = {
          correct: 0,
          incorrect: 0,
          nullAnswers: 0, // Adiciona contador de respostas nulas
          total: 0,
          percentage: 0
        };
      }

      // Incrementa o total de questões por tópico
      this.quiz.resultsByTopic[questionTopic].total++;

      if (submittedAnswer) {
        // Se o usuário respondeu, verifica se a resposta está correta ou incorreta
        if (submittedAnswer.correct) {
          this.result.correctAnswers++;
          this.quiz.resultsByTopic[questionTopic].correct++;
        } else {
          this.result.incorrectAnswers++;
          this.quiz.resultsByTopic[questionTopic].incorrect++;
        }
      } else {
        // Se não há resposta submetida, conta como nula
        this.result.nullAnswers++;
        this.quiz.resultsByTopic[questionTopic].nullAnswers++;
      }
    });

    // Calcula a porcentagem de acertos por tópico
    for (const topic in this.quiz.resultsByTopic) {
      const { correct, total } = this.quiz.resultsByTopic[topic];
      this.quiz.resultsByTopic[topic].percentage = (correct / total) * 100;
    }
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
      this.renderFunctions();
      this.scrollToTop();
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
      this.renderFunctions();
      this.scrollToTop();
    }
  }

  captureUserAnswer(questionId: number, answerId: number) {
    const question = this.quiz.questions.find((q) => q.id === questionId);
    const selectedAnswer = question?.answers.find((a) => a.id === answerId);

    if (selectedAnswer) {
      const existingSubmittedAnswerIndex = this.quiz.answers.findIndex(
        (a) => a.question.id === questionId
      );

      if (existingSubmittedAnswerIndex !== -1) {
        // Atualiza a resposta existente
        this.quiz.answers[existingSubmittedAnswerIndex] = selectedAnswer;
      } else {
        // Adiciona uma nova resposta
        this.quiz.answers.push(selectedAnswer);
      }

      // Recalcula os resultados após capturar a resposta
      this.calculateResults();
    }
  }

  isSelected(questionId: number, answerId: number): boolean {
    const submittedAnswer = this.quiz.answers.find(
      (a) => a.question.id === questionId
    );
    return submittedAnswer ? submittedAnswer.id === answerId : false;
  }

  startQuiz() {
    this.showStartScreen = false; // Oculta a tela inicial
    this.currentQuestionIndex = 0; // Começa na primeira questão
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    this.renderFunctions();
    this.scrollToTop();
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainer.innerHTML = `\\[${this.quiz.questions[this.currentQuestionIndex].text}\\]`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainerSolution.innerHTML = `\\[${this.quiz.questions[this.currentQuestionIndex].solution}\\]`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
    }, 0);
  }

  renderFunctions() {
    setTimeout(() => {
      const canvas = this.canvas?.nativeElement;
      if (!canvas || !this.quiz.questions[this.currentQuestionIndex].mathExpressions || this.quiz.questions[this.currentQuestionIndex].mathExpressions.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const scaleX = width / 20;
      const scaleY = height / 20;

      // Desenha os eixos
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Adiciona os números nos eixos
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        let y = height / 2 - i * scaleY;
        if (i !== 0) {
          ctx.fillText(i.toString(), x, height / 2 + 15);
          ctx.fillText(i.toString(), width / 2 - 15, y + 5);
        }
      }

      // Cores para múltiplos gráficos
      const colors = ['blue', 'red', 'green', 'orange', 'purple'];

      this.quiz.questions[this.currentQuestionIndex].mathExpressions.forEach((express, index) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2;

        for (let x = -10; x <= 10; x += 0.1) {
          try {
            let y = evaluate(express.expression!.replace(/x/g, `(${x})`));
            let screenX = width / 2 + x * scaleX;
            let screenY = height / 2 - y * scaleY;
            if (x === -10) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          } catch (error) {
            console.error(`Erro ao avaliar ${express.expression!}:`, error);
          }
        }
        ctx.stroke();
      });
    }, 0);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({
        severity: 'error',
        detail: 'Ocorreu um erro. Por favor, tente novamente.',
      });
    }
  }
}