export interface FlashCardFilter {
    topicId?: number;
    subjectId?: number;
    page: number;
    itemsPerPage: number;
    sort: string;
}