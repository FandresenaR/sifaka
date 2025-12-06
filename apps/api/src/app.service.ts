import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getApiInfo(): { message: string; version: string } {
    return {
      message: "Sifaka CRM API",
      version: "1.0.0",
    };
  }

  async healthCheck() {
    const dbHealth = await this.prisma.healthCheck();
    const connectionInfo = this.prisma.getConnectionInfo();

    return {
      status: dbHealth.status === "healthy" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      database: {
        ...dbHealth,
        host: connectionInfo.host,
        name: connectionInfo.database,
        connected: connectionInfo.connected,
      },
    };
  }
}
