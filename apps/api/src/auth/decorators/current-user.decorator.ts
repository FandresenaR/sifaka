import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Décorateur pour récupérer l'utilisateur connecté dans un contrôleur
 * Usage: @CurrentUser() user
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si un champ spécifique est demandé
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
