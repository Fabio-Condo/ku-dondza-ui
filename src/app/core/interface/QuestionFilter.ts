export interface QuestionFilter {
    searchParam?: string,
    text?: string;
    subject?: number;
    topic?: number;

    page: number,
    itemsPerPage: number,
    sort: string,
}