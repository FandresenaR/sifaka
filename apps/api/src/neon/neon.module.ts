import { Global, Module } from "@nestjs/common";
import { NeonService } from "./neon.service";

/**
 * Module Neon pour la connexion à la base de données
 * Marqué comme @Global pour être disponible dans toute l'application
 * sans avoir besoin de l'importer dans chaque module
 */
@Global()
@Module({
  providers: [NeonService],
  exports: [NeonService],
})
export class NeonModule {}
