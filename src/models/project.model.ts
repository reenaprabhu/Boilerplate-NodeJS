export interface Project {
id: string;
name: string;
description?: string;
ownerId: string; // references User.id
}


export interface CreateProjectDTO {
name: string;
description?: string;
ownerId: string;
}


export interface UpdateProjectDTO {
name?: string;
description?: string;
}