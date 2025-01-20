export class OnlineCourseRequirement {
    id?: number;
    designation?: string;

    isAdminMenuOpen: boolean = false;

    constructor(id?: number, designation?: string) {
        this.id = id;
        this.designation = designation;
    }
}