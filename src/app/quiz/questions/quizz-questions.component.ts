import { Component, OnInit, ViewChild } from '@angular/core';
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
      this.scrollToTop();
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
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