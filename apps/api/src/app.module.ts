import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule, AuthGuard, RolesGuard } from "./auth";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { ClientsModule } from "./clients/clients.module";
import { OsmModule } from "./osm/osm.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ClientsModule,
    OsmModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Auth guard global - toutes les routes nécessitent l'auth par défaut
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Roles guard global - vérifie les rôles après l'auth
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
