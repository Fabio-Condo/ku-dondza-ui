export interface QuestionFilter {
    searchParam?: string,
    text?: string;
    subjectId?: number;
    topicId?: number;
    difficultyLevel?: string;
    userId?: number,
    highlighted?: boolean,

    page: number,
    itemsPerPage: number,
    sort: string,
}