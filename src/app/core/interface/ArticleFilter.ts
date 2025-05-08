export interface ArticleFilter {
    searchParam?: string,
    title?: string;
    category?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}