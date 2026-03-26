export interface ExameFilter {
    searchParam?: string,
    examType?: string;
    institution?: string;
    subject?: number;

    beginYear?: Date,
    endYear?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}