import { TopicDtoWithTests } from "./TopicDtoWithTests";

export class SubjectProgressDTO {
    id!: number;
    subjectId!: number;
    subjectName!: string;

    subjectDescription!: string;
    subjectCategory!: string
    orderIndex!: number;
    topicDtoWithTests: TopicDtoWithTests[] = [];
    currentUserProgressRate: number = 0;
    totalTopics!: number;

    progressEnabled: boolean = false;
}    