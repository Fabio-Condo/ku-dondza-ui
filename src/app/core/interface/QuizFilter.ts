export interface QuizFilter {
    searchParam?: string;
    subject?: number;
    user?: number;
    difficultyLevel?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}