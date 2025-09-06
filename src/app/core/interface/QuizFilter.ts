export interface QuizFilter {
    searchParam?: string;
    subject?: number;
    user?: number;

    page: number,
    itemsPerPage: number,
    sort: string,
}