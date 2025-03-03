export interface ModuleFilter {
    searchParam?: string;
    name?: string;
    instrutor?: number;
    user: number;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}