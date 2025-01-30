import { Competition } from "./Competition";

export class Prize { 
    id!: number;
    description!: string;
    position!: string;
    competition!: Competition; 
}