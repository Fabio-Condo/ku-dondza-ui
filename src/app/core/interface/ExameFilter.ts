export interface ExameFilter {
    global?: string,
    institution?: number;
    description?: string;
    subject?: string;

    beginDate?: Date,
    endDate?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}