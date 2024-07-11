import { Comment } from "./Comment";
import { Like } from "./Like";
import { User } from "./User";

export class Post {
    public id!: number;
    public text: string;
    public type: string;
    public date: Date;
    public fileName!: string;
    public urlFile!: string;
    public user: User;
    public comments: Comment[] = [];
    public likes: Like[] = [];

    public showComments!: boolean;
    public isLiked: boolean;  // Adiciona a propriedade isLiked
    public isSaved: boolean;

    constructor() {
        this.text = '',
        this.type = ''
        this.date = new Date()
        this.fileName = '',
        this.urlFile = '',
        this.user = new User();
        this.showComments = false;
        this.isLiked = false;
        this.isSaved = false;
    }

}