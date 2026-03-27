export interface PaymentFilter {
    searchParam?: string,
    status?: string;

    pagina: number,
    ordenamento: string,
    itensPorPagina: number
}