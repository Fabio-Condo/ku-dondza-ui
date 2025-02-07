export class QuizQuestionStatisticsDTO {
    questionId!: number;
    questionText!: string;
    accuracyRate: number = 0;
    errorRate: number = 0;
    totalCorrectAnswers: number = 0;
    totalIncorrectAnswers: number = 0;
    topicName!: string;
    totalAnswers: number = 0;
    quizzesCount: number = 0;
}