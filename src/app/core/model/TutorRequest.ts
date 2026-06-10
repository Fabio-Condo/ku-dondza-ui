export class TutorRequest {
    questionId!: number; // Se for para Question
    topicId!: number; // Se for para Topic
    subjectId!: number; // Se for para Subject
    selectedAnswerId!: number | null;
    userId!: number;
    message!: string;
}