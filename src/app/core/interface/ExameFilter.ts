export interface ExameFilter {
    global?: string,
    institution?: string;
    description?: string;
    level?: string;
    subject?: string;

    beginDate?: Date,
    endDate?: Date,

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}