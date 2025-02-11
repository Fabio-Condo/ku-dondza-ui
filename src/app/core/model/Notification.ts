import { NotificationType } from "src/app/enum/notification-type.enum";
import { User } from "./User";

export interface Notification {
    id: number;
    user: User;
    sender: User;
    message: string;
    type: NotificationType;
    referenceId: number;
    isRead: boolean;
    createdAt: string;
}
