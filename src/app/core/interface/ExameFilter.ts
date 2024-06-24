export interface ExameFilter {
    global?: string,
    description?: string;
    institution?: number;
    subject?: number;

    beginDate?: Date,
    endDate?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}