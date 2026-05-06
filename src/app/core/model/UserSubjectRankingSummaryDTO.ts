export class UserSubjectRankingSummaryDTO {
    subjectId!: number;
    subjectName!: string;

    userId!: number;
    fullName!: string;
    profileImageUrl!: string;

    currentUserRank!: number;
    currentUserScore!: number;
    accuracyRate!: number;
    averageScore!: number;
    totalTopics!: number;
    totalTests!: number;
}