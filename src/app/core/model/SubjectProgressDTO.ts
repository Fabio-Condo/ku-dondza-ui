import { TopicTestsDTO } from "./TopicTestsDTO";

export class SubjectProgressDTO {
    id!: number;
    subjectId!: number;
    subjectName!: string;
    subjectDescription!: string;
    subjectCategory!: string
    orderIndex!: number;
    topicTests: TopicTestsDTO[] = [];
    currentUserProgressRate!: number;
    totalTopics!: number;
}    