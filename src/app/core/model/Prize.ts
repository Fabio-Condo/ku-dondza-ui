import { Competition } from "./Competition";

export class Prize { 
    id?: number;
    description?: string;
    position?: string;
    competition!: Competition; 

    constructor(id?: number, description?: string, position?: string) {
        this.id = id;
        this.description = description;
        this.position = position;
    }
}