import { Test } from "./Test";

export class TopicDtoWithTests {
    topicId!: number;
    topicName!: string;
    premium: boolean = false;
    orderIndex!: number;
    tests: Test[] = [];
    progressRate!: number;
    completed!: boolean;
}