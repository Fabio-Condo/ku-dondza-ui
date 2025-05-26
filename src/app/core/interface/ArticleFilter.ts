export interface ArticleFilter {
    searchParam?: string,
    title?: string;
    category?: string;
    userId?: number,

    page: number,
    itemsPerPage: number,
    sort: string,
}