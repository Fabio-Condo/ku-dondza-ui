import { Subject } from "./Subject";

export class Topic {
    id!: number;
    name!: string;
    subject = new Subject();
}