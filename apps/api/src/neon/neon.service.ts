import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, PoolConfig } from "@neondatabase/serverless";
import { getNeonConfig } from "./neon.config";
import ws from "ws";

// Configuration WebSocket pour Neon
neonConfig.webSocketConstructor = ws;

@Injectable()
export class NeonService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor() {
    // Récupère la configuration Neon depuis les variables d'environnement
    const config = getNeonConfig();

    // Configuration du pool Neon
    const poolConfig: PoolConfig = {
      host: config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl !== false,
      max: config.poolSize || 10,
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
    const config = getNeonConfig();
    return {
      host: config.host,
      database: config.database,
      connected: this.isConnected,
    };
  }
}
