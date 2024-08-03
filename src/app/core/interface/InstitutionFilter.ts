export interface InstitutionFilter {
    global?: string,
    name?: string;
    description?: string;
    type?: string;
    administrationType?: string;
    country?: string;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}