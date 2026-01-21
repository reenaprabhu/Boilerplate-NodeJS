export interface User {
id: string;
name: string;
email: string;
passwordHash: string;
roles: string[];
}


export interface CreateUserDTO {
name: string;
email: string;
password: string;
roles?: string[]; // Optional array of role names
}


export interface UpdateUserDTO {
name?: string;
email?: string;
password?: string;
roles?: string[];
}