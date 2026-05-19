export interface ExameFilter {
    searchParam?: string,
    examType?: string;
    institution?: string;
    subjectId?: number;

    beginYear?: number,
    endYear?: number,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}