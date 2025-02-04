import { Module } from "./Module";

export class OnlineCourseContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    contentType!: string;
    module = new Module();
    position!: number;
    
    isMarked: boolean = false; // Marcado como assistido

    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;

}