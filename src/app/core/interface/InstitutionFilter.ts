export interface InstitutionFilter {
    global?: string,
    name?: string;
    description?: string;
    level?: string;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}