export interface ExameFilter {
    searchParam?: string,
    description?: string;
    institution?: number;
    subject?: number;

    beginDate?: Date,
    endDate?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}