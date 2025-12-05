import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    // Ajouter d'autres modules ici au fur et à mesure
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
