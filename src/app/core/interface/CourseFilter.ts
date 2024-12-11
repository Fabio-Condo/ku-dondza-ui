export interface CourseFilter {
    searchParam?: string,
    name?: string;
    institution?: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}