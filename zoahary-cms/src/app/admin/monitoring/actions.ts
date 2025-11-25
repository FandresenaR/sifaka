'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function blockIp(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized");
    }

    const ip = formData.get("ip") as string;
    const reason = formData.get("reason") as string;

    if (!ip) return;

    try {
        await prisma.blockedIp.create({
            data: {
                ip,
                reason,
            },
        });
    } catch (error) {
        // Ignore duplicate errors
        console.error("Failed to block IP:", error);
    }

    revalidatePath("/admin/monitoring");
}

export async function unblockIp(ip: string) {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.blockedIp.delete({
            where: { ip },
        });
    } catch (error) {
        console.error("Failed to unblock IP:", error);
    }

    revalidatePath("/admin/monitoring");
}
