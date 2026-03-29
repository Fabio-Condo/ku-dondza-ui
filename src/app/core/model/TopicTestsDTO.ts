import { Test } from "./Test";

export class TopicTestsDTO {
    topicId!: number;
    topicName!: string;
    orderIndex!: number;
    tests: Test[] = [];
    progressRate!: number;
    completed!: boolean;
}