import { FlashCard } from "./FlashCard";

export interface FlashCardDeckResponse {
  topicId: number;
  topicName: string;
  subjectName: string;
  cards: FlashCard[];
}