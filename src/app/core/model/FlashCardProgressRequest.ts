export interface FlashCardProgressRequest {
  flashCardId: number;
  status: 'UNSEEN' | 'LEARNING' | 'KNOWN';
}