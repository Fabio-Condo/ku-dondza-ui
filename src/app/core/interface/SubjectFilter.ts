export interface SubjectFilter {
    searchParam?: string,
    name?: string;
    enabled?: boolean;
    subjectId?: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}