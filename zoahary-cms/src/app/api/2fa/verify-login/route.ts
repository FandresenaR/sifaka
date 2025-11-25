import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTP } from "@/lib/2fa";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que le 2FA est activé
    if (!session.user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA non activé" }, { status: 400 });
    }

    // Vérifier que le 2FA n'est pas déjà vérifié
    if (session.user.twoFactorVerified) {
      return NextResponse.json({ success: true, message: "Déjà vérifié" });
    }

    const { token } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { twoFactorSecret: true, twoFactorBackupCodes: true },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA non configuré" }, { status: 400 });
    }

    // Vérifier le code TOTP
    const isValid = verifyTOTP(token, user.twoFactorSecret);

    // Si le code TOTP est invalide, vérifier les codes de backup
    if (!isValid) {
      const isBackupCode = user.twoFactorBackupCodes?.includes(token);
      
      if (isBackupCode) {
        // Supprimer le code de backup utilisé
        const updatedBackupCodes = user.twoFactorBackupCodes!.filter(
          (code) => code !== token
        );
        
        await prisma.user.update({
          where: { email: session.user.email },
          data: { twoFactorBackupCodes: updatedBackupCodes },
        });

        return NextResponse.json({ success: true, usedBackupCode: true });
      }

      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
