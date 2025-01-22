import { Topic } from "./Topic";

export class Subject {
    id!: number;
    name!: string;
    topics: Topic[] = [];
}