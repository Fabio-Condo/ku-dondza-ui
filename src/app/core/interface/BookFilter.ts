export interface BookFilter {
    searchParam?: string,
    name?: string;
    description?: string;
    author?: string;
    subject?: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}