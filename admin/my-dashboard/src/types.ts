export enum status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Error = "ERROR",
  Maintenance = "MAINTENANCE",
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Local_servers {
  id: number;
  local_server_id: string;
  client_id: number;
  forfait: string;
  username: string;
  status: status;
}
