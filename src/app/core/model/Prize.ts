import { Competition } from "./Competition";

export class Prize { 
    id?: number;
    description?: string;
    position?: number;
    competition!: Competition; 

    constructor(id?: number, description?: string, position?: number) {
        this.id = id;
        this.description = description;
        this.position = position;
    }
}