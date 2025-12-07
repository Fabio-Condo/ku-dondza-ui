import { TopicTestDTO } from "./TopicTestDTO";

export class TopicWithTestsDTO {
    topicId!: number;
    topicName!: string;
    orderIndex!: number;
    tests: TopicTestDTO[] = [];
}