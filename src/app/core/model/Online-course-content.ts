import { Module } from "./Module";

export class OnlineCourseContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    contentType!: string;
    time!: string;
    module = new Module();
    position!: number;
    
    isMarked: boolean = false; // Marcado como assistido

    showLoadingMarked: boolean = false;
    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;

}