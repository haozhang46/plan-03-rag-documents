export interface ResourceDeclaration {
  type: string;
  name: string;
  version?: string;
  optional?: boolean;
}

export interface ResourceConnection {
  name: string;
  type: string;
  host: string;
  port: number;
  dsn?: string;
}
