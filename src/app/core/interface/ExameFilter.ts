export interface ExameFilter {
    searchParam?: string,
    examType?: string;
    institution?: string;
    subject?: number;

    beginDate?: Date,
    endDate?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}