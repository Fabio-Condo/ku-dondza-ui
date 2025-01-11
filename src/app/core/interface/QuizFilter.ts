export interface QuizFilter {
    searchParam?: string;
    title?: string;
    subject?: number;
    user?: number;

    page: number,
    itemsPerPage: number,
    sort: string,
}