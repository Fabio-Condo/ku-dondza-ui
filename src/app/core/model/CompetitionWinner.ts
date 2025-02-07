import { Competition } from "./Competition";
import { Prize } from "./Prize";
import { User } from "./User";

export class CompetitionWinner { 
    id!: number;
    description!: string;
    competition!: Competition; 
    prize!: Prize; 
    user!: User; 
}