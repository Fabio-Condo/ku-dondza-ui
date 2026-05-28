export interface QuestionFilter {
    searchParam?: string,
    text?: string;
    subject?: number;
    topic?: number;
    difficultyLevel?: string;
    userId?: number,
    highlighted?: boolean,

    page: number,
    itemsPerPage: number,
    sort: string,
}