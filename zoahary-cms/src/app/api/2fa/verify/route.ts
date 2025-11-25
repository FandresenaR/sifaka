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

    const { token } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA non configuré" }, { status: 400 });
    }

    const isValid = verifyTOTP(token, user.twoFactorSecret);

    if (isValid) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { twoFactorEnabled: true },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
