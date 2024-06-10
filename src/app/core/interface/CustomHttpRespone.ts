export interface CustomHttpRespone {  // Classe que sera usada nos metodos resetPassword e deleteUser. Esses metodos CustomHttpRespone pois o backend tambem retorna ResponseEntity<HttpResponse> nesses metodos
    httpStatusCode: number;    // Ou seja, os metodos resetPassword e deleteUser retornam HttpResponse no backend
    httpStatus: string;
    reson: string;
    message: string;
}