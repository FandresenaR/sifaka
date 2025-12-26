import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, PoolConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configuration WebSocket pour Neon (nécessaire en environnement Node.js)
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = "password";

/**
 * PrismaService avec connexion directe à Neon
 * Utilise des variables d'environnement séparées au lieu d'une connection string
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor() {
    // Récupère la configuration depuis les variables d'environnement séparées
    // Récupère la configuration depuis les variables d'environnement
    let host = process.env.NEON_HOST;
    let database = process.env.NEON_DATABASE;
    let user = process.env.NEON_USER;
    let password = process.env.NEON_PASSWORD;
    const ssl = process.env.NEON_SSL !== "false";
    const poolSize = parseInt(process.env.NEON_POOL_SIZE || "10", 10);

    // Fallback: Si la config éclatée est manquante, essayer de parser DATABASE_URL
    if (!host || !database || !user || !password) {
      const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (connectionString) {
        try {
          // Format attendu: postgres://user:password@host:port/database
          const urlKey = new URL(connectionString);
          host = urlKey.hostname;
          database = urlKey.pathname.replace(/^\//, ""); // Enlever le slash initial
          user = urlKey.username;
          password = urlKey.password;

          console.log(`ℹ️ Using configuration parsed from DATABASE_URL for ${host}`);
        } catch (e) {
          console.error("❌ Failed to parse DATABASE_URL:", e);
        }
      }
    }

    if (!host || !database || !user || !password) {
      throw new Error(
        "Missing Neon database configuration. Please set NEON_HOST, NEON_DATABASE, NEON_USER, and NEON_PASSWORD environment variables, or provide a valid DATABASE_URL.",
      );
    }

    // Configuration du pool Neon
    const poolConfig: PoolConfig = {
      host,
      database,
      user,
      password,
      ssl,
      max: poolSize,
    };

    // Crée l'adapter Prisma pour Neon avec la config
    const adapter = new PrismaNeon(poolConfig);

    // Initialise PrismaClient avec l'adapter Neon
    super({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });

    console.log(`🔧 PrismaService configured for Neon: ${host}/${database}`);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log("✅ Connected to Neon database successfully");
    } catch (error) {
      console.error("❌ Failed to connect to Neon database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.isConnected = false;
    console.log("🔌 Disconnected from Neon database");
  }

  /**
   * Vérifie si la connexion à la base de données est active
   */
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    message: string;
  }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: "healthy", message: "Database connection is healthy" };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Retourne les informations de connexion (sans données sensibles)
   */
  getConnectionInfo(): {
    host: string;
    database: string;
    connected: boolean;
  } {
    return {
      host: process.env.NEON_HOST || "unknown",
      database: process.env.NEON_DATABASE || "unknown",
      connected: this.isConnected,
    };
  }
}
