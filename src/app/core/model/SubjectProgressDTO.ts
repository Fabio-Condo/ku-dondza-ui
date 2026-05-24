import { TopicDtoWithTests } from "./TopicDtoWithTests";

export class SubjectProgressDTO {
    id!: number;
    subjectId!: number;
    subjectName!: string;
    subjectUrlFile!: string;

    subjectDescription!: string;
    subjectCategory!: string
    orderIndex!: number;
    topicDtoWithTests: TopicDtoWithTests[] = [];
    currentUserProgressRate: number = 0;

    currentUserTotalTestsScore: number = 0;
    currentUserScore: number = 0;
    currentUserRank: number = 0;

    totalTopics!: number;
    totalTests!: number;

    progressEnabled: boolean = false;
}    