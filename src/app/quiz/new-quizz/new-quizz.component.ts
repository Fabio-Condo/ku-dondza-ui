import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Answer } from 'src/app/core/model/Answer';
import { QuestionService } from 'src/app/questions/question.service';
import { TopicService } from 'src/app/core/topics/courseService.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Topic } from 'src/app/core/model/Topic';
import { SubjectsService } from 'src/app/subjects/subjects.service';
declare const MathJax: any;

@Component({
  selector: 'app-new-quizz',
  templateUrl: './new-quizz.component.html',
  styleUrls: ['./new-quizz.component.css']
})
export class NewQuizzComponent implements OnInit {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  showLoading: boolean = false;
  showGetSubjectLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  imagePath = './assets/images/funcao do grau 2.png';

  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    nullAnswers: number; // Nova propriedade para respostas nulas
  } = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };
  
  showCorrection: boolean = false;

  showStartScreen: boolean = true;
  showFinalScreen: boolean = false;

  subjects: Subject[] = [];
  topics: Topic[] = [];

  loggedUser: User = new User();

  submited: boolean = false;

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  };

  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  // Método para calcular os resultados
  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0;

    // Reinicia o objeto de resultados por tópico
    this.quiz.resultsByTopic = {};

    // Itera sobre todas as questões do quiz
    this.quiz.questions.forEach((question) => {
      const submittedAnswer = this.submittedAnswers.find(
        (a) => a.question?.id === question.id
      );

      // Obtém o tópico da questão
      const questionTopic = question.topic?.name || 'Sem tópico';

      // Inicializa o tópico no objeto resultsByTopic, se necessário
      if (!this.quiz.resultsByTopic[questionTopic]) {
        this.quiz.resultsByTopic[questionTopic] = {
          correct: 0,
          incorrect: 0,
          nullAnswers: 0,
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
        // Se não há resposta submetida, conta como não respondida
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

  // Método para submeter as respostas
  submitAnswers() {
    // Calcula os resultados
    this.calculateResults();

    // Exibe a tela final
    this.showFinalScreen = true;

    // Salva o quiz, se ainda não foi submetido
    if (!this.submited) {
      this.saveQuiz();
    }
  }

  // Método para iniciar o quiz
  startQuiz() {
    this.showStartScreen = false;
    this.currentQuestionIndex = 0;
    this.renderMathExpressions();
    this.scrollToTop();
  }

  // Método para carregar as disciplinas
  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  // Método para carregar os tópicos de uma disciplina
  getTopicsBySubjectId(subjectId: number): void {
    this.topicService.getSubjectsById(subjectId).subscribe(
      (dados: Topic[]) => {
        this.quiz.questions = [];
        this.topics = [];
        this.topics = dados;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para carregar as questões
  getQuestions(): void {
    const selectedTopicIds = this.getSelectedTopicIds();

    this.showLoading = true;
    this.questionService.getQuestionsByTopics(selectedTopicIds).subscribe(
      (dados: Question[]) => {
        this.questions = dados;
        this.quiz.questions = this.questions;
        this.showLoading = false;
        this.renderMathExpressions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para alternar a seleção de um tópico
  toggleTopic(topic: Topic): void {
    topic.selected = !topic.selected;
  }

  // Método para obter os tópicos selecionados
  getSelectedTopics(): Topic[] {
    return this.topics.filter(topic => topic.selected);
  }

  // Método para obter os IDs dos tópicos selecionados
  getSelectedTopicIds(): number[] {
    return this.topics.filter(topic => topic.selected).map(topic => topic.id);
  }

  // Método para salvar o quiz
  saveQuiz() {
    this.quiz.selectedTopics = this.getSelectedTopics();

    const topicIds = this.quiz.selectedTopics.map(topic => topic.id);
    const questionIds = this.quiz.questions.map(question => question.id);
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.quiz.user = this.loggedUser;

    this.quizService.saveQuiz(this.quiz, topicIds, questionIds, userAnswerIds).subscribe(
      (response) => {
        this.submited = true;
        this.messageService.add({ severity: 'success', detail: 'Quiz salvo com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  // Método para capturar a resposta do usuário
  captureUserAnswer(questionId: number, answerId: number | null): void {
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      let userAnswer: Answer;

      if (answerId !== null) {
        const answer = question.answers.find(a => a.id === answerId);
        if (answer) {
          userAnswer = {
            id: answer.id,
            text: answer.text,
            correct: answer.correct,
            question: question
          };
        } else {
          return; // Resposta inválida
        }
      } else {
        // Resposta nula (não respondida)
        userAnswer = {
          id: -1, // ID inválido para indicar resposta nula
          text: 'Não respondida',
          correct: false,
          question: question
        };
      }

      // Atualiza ou adiciona a resposta
      const existingAnswerIndex = this.submittedAnswers.findIndex(a => a.question?.id === questionId);
      if (existingAnswerIndex !== -1) {
        this.submittedAnswers[existingAnswerIndex] = userAnswer;
      } else {
        this.submittedAnswers.push(userAnswer);
      }
    }
  }

  // Método para verificar se uma resposta foi selecionada
  isSelected(questionId: number, answerId: number): boolean {
    const userAnswer = this.submittedAnswers.find(a => a.question?.id === questionId);
    return userAnswer ? userAnswer.id === answerId : false;
  }

  // Método para revisar as questões
  reviewQuestions() {
    this.showFinalScreen = false;
    this.currentQuestionIndex = 0;
    this.scrollToTop();
  }

  // Método para iniciar um novo quiz
  newQuiz() {
    this.showFinalScreen = false;
    this.showStartScreen = true;
    this.submittedAnswers = [];
    this.currentQuestionIndex = 0;
    this.result = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };
  }

  // Método para alternar a exibição da correção
  toggleCorrection() {
    this.showCorrection = true;
    this.currentQuestionIndex = 0;
    this.showFinalScreen = false;

    // Aguarda a atualização do DOM antes de renderizar MathJax
    setTimeout(() => {
      this.renderMathExpressions();
    }, 0);

    this.scrollToTop();
  }

  // Método para ir para a questão anterior
  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions();
      this.scrollToTop();
    }
  }

  // Método para ir para a próxima questão
  goToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions();
      this.scrollToTop();
    }
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

  // Método para rolar a página para o topo
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método para enviar notificações de erro
  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}