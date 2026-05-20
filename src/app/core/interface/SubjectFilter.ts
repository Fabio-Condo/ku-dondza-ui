export interface SubjectFilter {
    searchParam?: string,
    enabled?: boolean;
    subjectId?: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}