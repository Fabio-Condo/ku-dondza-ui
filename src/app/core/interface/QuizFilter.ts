export interface QuizFilter {
    searchParam?: string;
    title?: string;
    subject?: number;
    user?: number;
    difficultyLevel?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}