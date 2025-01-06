import { Module } from "./Module";

export class OnlineCourseContent {
    id!: number;
    description!: string;
    fileName!: string;
    urlFile!: string;
    contentType!: string;
    module = new Module();
    position!: number;
    
    showLoadingDownload: boolean = false;
    isAdminMenuOpen: boolean = false;

}