import { Subject } from "../model/Subject";

export interface ChallengeFilter {

    title?: string;
    description?: string;
    difficultyLevel?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    subjectId?: number;

    page: number;
    itemsPerPage: number;
    sort: string;
}