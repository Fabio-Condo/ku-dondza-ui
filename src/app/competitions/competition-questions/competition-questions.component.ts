import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { CompetitionService } from '../competition.service';
import { Competition } from 'src/app/core/model/Competition';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
declare const MathJax: any;


@Component({
  selector: 'app-competition-questions',
  templateUrl: './competition-questions.component.html',
  styleUrls: ['./competition-questions.component.css']
})
export class CompetitionQuestionsComponent implements OnInit {

  competition: Competition = new Competition();
  questions: Question[] = [];
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  showLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  answers: Array<Answer> = [];
  currentQuestionIndex: number = 0;

  // Armazenar as respostas do usuário
  userAnswers: { questionId: number; answerId: number }[] = [];

  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    nullAnswers: number; // Nova propriedade para respostas nulas
  } = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };

  showCorrection: boolean = false;

  showStartScreen: boolean = true;
  showFinalScreen: boolean = false;

  correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  loggedUser: User = new User();

  submited: boolean = false;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 105,
    sort: 'id,asc'
  };

  constructor(
    private competitionService: CompetitionService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const competitionId = this.route.snapshot.params['id'];
    if (competitionId) {
      this.getCompetitionByCompetitionId(competitionId);
    }
    this.scrollToTop();
  }

  getCompetitionByCompetitionId(competitionId: string) {
    this.competitionService.getCompetitionByCompetitionId(competitionId).subscribe(
      (response) => {
        this.competition = response;
        this.getQuestionsByCompetitionId(this.competition.id);
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) { // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuestionsByCompetitionId(competitionId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1;
    this.competitionService.getQuestionsByCompetitionId(competitionId, this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions = dados.content;
        this.competition.questions = dados.content;
        this.showLoading = false;
        this.renderMathExpressions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  displayResults() {
    const message = `Você acertou ${this.result.correctAnswers} resposta(s) e errou ${this.result.incorrectAnswers} resposta(s).`;
    this.messageService.add({ severity: 'info', detail: message });
  }

  // Método para submeter as respostas
  submitAnswers() {
    // Calcula os resultados
    this.calculateResults();

    // Exibe a tela final
    this.showFinalScreen = true;

    // Salva o quiz, se ainda não foi submetido
    if (!this.submited) {
      //this.saveQuiz();
    }
  }

  // Método para calcular os resultados
  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0;

    // Reinicia o objeto de resultados por tópico
    this.competition.resultsByTopic = {};

    // Itera sobre todas as questões do quiz
    this.competition.questions.forEach((question) => {
      const submittedAnswer = this.submittedAnswers.find(
        (a) => a.question?.id === question.id
      );

      // Obtém o tópico da questão
      const questionTopic = question.topic?.name || 'Sem tópico';

      // Inicializa o tópico no objeto resultsByTopic, se necessário
      if (!this.competition.resultsByTopic[questionTopic]) {
        this.competition.resultsByTopic[questionTopic] = {
          correct: 0,
          incorrect: 0,
          nullAnswers: 0,
          total: 0,
          percentage: 0
        };
      }

      // Incrementa o total de questões por tópico
      this.competition.resultsByTopic[questionTopic].total++;

      if (submittedAnswer) {
        // Se o usuário respondeu, verifica se a resposta está correta ou incorreta
        if (submittedAnswer.correct) {
          this.result.correctAnswers++;
          this.competition.resultsByTopic[questionTopic].correct++;
        } else {
          this.result.incorrectAnswers++;
          this.competition.resultsByTopic[questionTopic].incorrect++;
        }
      } else {
        // Se não há resposta submetida, conta como não respondida
        this.result.nullAnswers++;
        this.competition.resultsByTopic[questionTopic].nullAnswers++;
      }
    });

    // Calcula a porcentagem de acertos por tópico
    for (const topic in this.competition.resultsByTopic) {
      const { correct, total } = this.competition.resultsByTopic[topic];
      this.competition.resultsByTopic[topic].percentage = (correct / total) * 100;
    }
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
        mathContainer.innerHTML = `\\[${this.competition.questions[this.currentQuestionIndex].text}\\]`;

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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}

