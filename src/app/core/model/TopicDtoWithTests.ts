import { Test } from "./Test";

export class TopicDtoWithTests {
    topicId!: number;
    topicName!: string;
    orderIndex!: number;
    tests: Test[] = [];
    progressRate!: number;
    completed!: boolean;
}