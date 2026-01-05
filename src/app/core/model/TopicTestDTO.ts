import { Quiz } from "./Quiz";
import { Topic } from "./Topic";

export class TopicTestDTO {
  id!: number;
  difficultyLevel!: string; // BEGINNER, INTERMEDIATE, ADVANCED
  orderIndex!: number;
  topicTestStatus!: string; // COMPLETED, ACTIVE, LOCKED
  accuracyRate!: number;
  totalQuestions!: number;
  topic = new Topic(); // id, name, position
  submittedQuizzes: Quiz[] = [];
}
