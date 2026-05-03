export interface SubjectFilter {
    searchParam?: string,
    name?: string;
    enabled?: boolean;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}