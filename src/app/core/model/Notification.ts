import { NotificationType } from "src/app/enum/notification-type.enum";
import { User } from "./User";
import { Competition } from "./Competition";

export interface Notification {
    id: number;
    user: User;
    sender: User;
    competition: Competition;
    message: string;
    //type: NotificationType;
    type: string;
    referenceId: number;
    read: boolean;
    createdAt: string;

    isAdminMenuOpen: boolean;
}
