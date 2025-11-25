import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTOTPSecret, generateBackupCodes } from "@/lib/2fa";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { secret, qrCode } = await generateTOTPSecret(session.user.email);
    const backupCodes = generateBackupCodes();

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
      },
    });

    return NextResponse.json({ qrCode, backupCodes });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
