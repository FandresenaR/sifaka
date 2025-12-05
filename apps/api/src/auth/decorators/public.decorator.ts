import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Décorateur pour marquer une route comme publique (pas besoin d'auth)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
