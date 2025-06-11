import { Prize } from "./Prize";
import { User } from "./User";

export class PrizeAssignment {
    id!: number;
    user = new User();
    prize = new Prize();
    assignedAt!: Date;
}