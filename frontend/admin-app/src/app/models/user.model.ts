export interface User {
  id: string;
  keycloakId: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  dateOfBirth?: string;
  phone?: string;
  enabled: boolean;
  deleted: boolean;
  createdDate: string;
  lastModifiedDate?: string;
}

export interface UserRequest {
  firstname?: string;
  lastname?: string;
  dateOfBirth?: string;
  phone?: string;
}
