export interface InstitutionFilter {
    global?: string,
    name?: string;
    description?: string;
    type?: string;
    administrationType?: string;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}