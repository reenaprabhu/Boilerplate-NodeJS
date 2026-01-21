export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}
