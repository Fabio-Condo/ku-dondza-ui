export interface TopicFilter {
    searchParam?: string,
    name?: string;
    subject?: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}