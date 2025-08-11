import { Topic } from "./Topic";

export class TopicContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    contentType!: string;
    time!: string;
    topic = new Topic();
    position!: number;

    markedByUser: boolean = false; // Marcado como assistido

    showLoadingMarked: boolean = false;
    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;
}