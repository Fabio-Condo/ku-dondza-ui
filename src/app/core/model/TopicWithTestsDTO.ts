import { Test } from "./Test";

export class TopicWithTestsDTO {
    topicId!: number;
    topicName!: string;
    orderIndex!: number;
    tests: Test[] = [];
}