export interface QuestionFilter {
    searchParam?: string,
    text?: string;
    subject?: number;
    topic?: number;
    difficultyLevel?: string;
    userId?: number,

    page: number,
    itemsPerPage: number,
    sort: string,
}