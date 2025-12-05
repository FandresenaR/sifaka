import { neonConfig, PoolConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * Configuration Neon Database
 * Utilise des variables séparées au lieu d'une connection string
 * pour plus de flexibilité et sécurité
 */

// Configuration WebSocket pour Neon (nécessaire en environnement Node.js)
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = "password";

export interface NeonDatabaseConfig {
  host: string;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
}

/**
 * Récupère la configuration depuis les variables d'environnement
 */
export function getNeonConfig(): NeonDatabaseConfig {
  const host = process.env.NEON_HOST;
  const database = process.env.NEON_DATABASE;
  const user = process.env.NEON_USER;
  const password = process.env.NEON_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error(
      "Missing Neon database configuration. Please set NEON_HOST, NEON_DATABASE, NEON_USER, and NEON_PASSWORD environment variables.",
    );
  }

  return {
    host,
    database,
    user,
    password,
    ssl: process.env.NEON_SSL !== "false",
    poolSize: parseInt(process.env.NEON_POOL_SIZE || "10", 10),
  };
}

/**
 * Construit une connection string à partir de la configuration
 * Utilisé en interne par Prisma CLI pour les migrations
 */
export function buildConnectionString(config: NeonDatabaseConfig): string {
  const sslMode = config.ssl !== false ? "?sslmode=require" : "";
  return `postgresql://${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@${config.host}/${config.database}${sslMode}`;
}

/**
 * Crée la configuration du pool pour PrismaNeon
 */
export function createNeonPoolConfig(config: NeonDatabaseConfig): PoolConfig {
  return {
    host: config.host,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl !== false,
    max: config.poolSize || 10,
  };
}

export { neonConfig };
