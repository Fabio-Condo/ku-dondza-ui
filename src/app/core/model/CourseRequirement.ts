export class CourseRequirement {
    id?: number;
    designation?: string;

    constructor(id?: number, designation?: string) {
        this.id = id;
        this.designation = designation;
    }
}