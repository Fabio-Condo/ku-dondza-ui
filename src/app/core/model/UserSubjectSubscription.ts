import { Subject } from "./Subject";
import { User } from "./User";

export class UserSubjectSubscription {
    id!: number;
    user = new User();
    subject = new Subject();
    startDate!: Date;

    isAdminMenuOpen: boolean = false;
}