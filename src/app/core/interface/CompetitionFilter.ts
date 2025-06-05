export interface CompetitionFilter {
    searchParam?: string;
    title?: string;
    subject?: number;
    competitionType?: string;
    difficultyLevel?: string;

    page: number,
    itemsPerPage: number,
    sort: string,
}