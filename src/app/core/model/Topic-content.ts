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

    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;
}