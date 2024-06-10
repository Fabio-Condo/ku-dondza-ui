export enum NotificationType {    
    DEFAULT = 'default',
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning'
}

// enum de notificacao que sera enviada atraves
// de uma popout, deve ser uma enum, pois as opcoes devem ser apenas essas

// Nota: A enum sera chamada no metodo notify service NotificationService, ou seja um parametro do metodo notify