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

export enum StatusEnum {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    ERROR = "ERROR",
    MAINTENANCE = "MAINTENANCE"
}

export interface Alerte {
  id: number;
  local_server_id: number;
  client_id: number;
  etat_de_la_chute: string;
  temps_au_sol: string;
  niveau_urgence: string;
  timestamp: string;
  is_resolved: boolean;
}