import { User } from "./User";

export class Wallet {
    id?: number;
    phoneNumber?: string;
    type?: string; // MPESA ou EMOLA
    default?: boolean;
    user = new User();

    constructor(id?: number, phoneNumber?: string, type?: string, isDefault?: boolean) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.type = type;
        this.default = isDefault;
    }
}