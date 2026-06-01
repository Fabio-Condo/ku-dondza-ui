export interface TopicFilter {
    searchParam?: string,
    name?: string;
    subjectId?: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}