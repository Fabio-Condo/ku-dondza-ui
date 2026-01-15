import { Quiz } from "./Quiz";
import { Topic } from "./Topic";

export class Test {
  id!: number;
  difficultyLevel!: string; // BEGINNER, INTERMEDIATE, ADVANCED
  orderIndex!: number;
  accuracyRate!: number;
  totalQuestions!: number;
  topic = new Topic(); // id, name, position
  submittedQuizzes: Quiz[] = [];
}
