import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "Aucun fichier fourni" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "Le fichier est trop volumineux (max 5MB)" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let data: string;
        const fileType = file.type;

        // Handle different file types
        if (fileType.startsWith("image/")) {
            // Convert image to base64
            data = buffer.toString("base64");
        } else if (
            fileType === "text/plain" ||
            fileType === "text/markdown" ||
            fileType === "application/json"
        ) {
            // Convert text files to string
            data = buffer.toString("utf-8");
        } else if (fileType === "application/pdf") {
            // For PDF, convert to base64 (some models can handle it)
            data = buffer.toString("base64");
        } else {
            return NextResponse.json(
                { error: "Type de fichier non supporté" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            name: file.name,
            type: fileType,
            data,
            size: file.size,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'upload du fichier" },
            { status: 500 }
        );
    }
}
