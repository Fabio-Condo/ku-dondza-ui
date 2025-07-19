export interface CommentFilter {
    questionId?: number,

    page: number,
    itemsPerPage: number,
    sort: string,
}