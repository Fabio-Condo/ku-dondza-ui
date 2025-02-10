export interface CompetitionFilter {
    searchParam?: string;
    title?: string;
    subject?: number;
    difficultyLevel?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}