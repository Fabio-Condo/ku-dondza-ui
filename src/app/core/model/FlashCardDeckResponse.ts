import { FlashCard } from "./FlashCard";

export interface FlashCardDeckResponse {
    topicId: number;
    topicName: string;
    subjectId: string;
    subjectName: string;
    cards: FlashCard[];
}