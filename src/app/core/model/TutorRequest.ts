export class TutorRequest {
    questionId!: number; // Se for para Question
    topicId!: number; // Se for para Topic
    selectedAnswerId!: number | null;
    userId!: number;
    message!: string;
}