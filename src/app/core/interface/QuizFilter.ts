export interface QuizFilter {
    searchParam?: string;
    subject?: number;
    title?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}