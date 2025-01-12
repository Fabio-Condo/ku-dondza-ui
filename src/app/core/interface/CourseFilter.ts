export interface CourseFilter {
    searchParam?: string,
    name?: string;
    institution?: number;
    level?: string;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}