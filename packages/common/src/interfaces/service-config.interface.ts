export interface ServiceConfig {
  name: string;
  port: number;
  mongoUrl: string;
  jwtSecret: string;
}
