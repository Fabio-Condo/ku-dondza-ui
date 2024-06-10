
export class Post {
    public id!: number;
    public text: string;
    public type: string;
    public imageUrl: string;
    public date: Date;

    constructor() {
        this.text = '',
        this.imageUrl = '',
        this.type = ''
        this.date = new Date()
    }

}