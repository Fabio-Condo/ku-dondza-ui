import { Subject } from "./Subject";

export class Blog {
    id!: number;
    title!: string;
    content!: string;
    postDate!: Date;
    fileName!: string;
    urlFile!: string;
    subject = new Subject();

    isLiked: boolean = false;
    isSaved: boolean = false;
    numberOfLikes: number = 0;

    isAdminMenuOpen: boolean = false;
}