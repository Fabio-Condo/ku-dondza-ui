export interface ExameFilter {
    searchParam?: string,
    examType?: string;
    institution?: string;
    subject?: number;

    beginYear?: number,
    endYear?: number,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}