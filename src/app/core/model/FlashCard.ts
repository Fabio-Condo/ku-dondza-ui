export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  category: string;
  note?: string;
  status: 'UNSEEN' | 'KNOWN' | 'LEARNING';
  saved: boolean;
}