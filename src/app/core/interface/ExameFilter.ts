export interface ExameFilter {
    searchParam?: string,
    examType?: string;
    subject?: number;

    beginDate?: Date,
    endDate?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}