export interface ArticleFilter {
    searchParam?: string,
    title?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}