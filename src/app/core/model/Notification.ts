export interface Notification {
    id: number;
    userId: number;
    message: string;
    type: string; // Exemplo: "LIKE", "COMMENT", "FRIEND_REQUEST"
    read: boolean;
    createdAt: Date;
  }
  