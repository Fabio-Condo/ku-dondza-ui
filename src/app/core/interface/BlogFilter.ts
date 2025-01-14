export interface BlogFilter {
    searchParam?: string,
    title?: string;
    subject?: number;

    page: number,
    itemsPerPage: number,
    sort: string,
}