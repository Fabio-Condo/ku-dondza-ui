import { Like } from "./Like";

export class Article {
  id!: number;
  articleId!: string;
  title!: string;
  content!: string;
  lastUpdated!: Date;
  date!: Date;
  readingTimeMinutes!: number;
  fileName!: string;
  urlFile!: string;
  category!: string;
  likes!: Like[];

  isLiked: boolean = false;
  isSaved: boolean = false;
  numberOfLikes: number = 0;

  isAdminMenuOpen: boolean = false;
} 