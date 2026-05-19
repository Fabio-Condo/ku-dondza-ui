export interface QuizFilter {
    searchParam?: string;
    subjectId?: number;
    userId?: number;

    page: number,
    itemsPerPage: number,
    sort: string,
}