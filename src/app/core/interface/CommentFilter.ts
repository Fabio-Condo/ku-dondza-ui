export interface CommentFilter {
    questionId?: number,
    userId?: number,

    page: number,
    itemsPerPage: number,
    sort: string,
}