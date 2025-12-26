import { PrismaClient } from "../apps/api/src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, PoolConfig } from "@neondatabase/serverless";
import ws from "ws";

/**
 * MIGRATION SCRIPT: Sync Data from DEV to PROD
 * 
 * INSTRUCTIONS:
 * 1. Set the environment variables below carefully.
 * 2. Run with: npx tsx scripts/sync-neon-data.ts
 */

const SOURCE_URL = "postgres://user:password@dev-host/neondb"; // DEV
const TARGET_URL = "postgres://user:password@prod-host/neondb"; // PROD

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = "password";

async function createClient(url: string) {
    const urlKey = new URL(url);
    const poolConfig: PoolConfig = {
        host: urlKey.hostname,
        database: urlKey.pathname.replace(/^\//, ""),
        user: urlKey.username,
        password: urlKey.password,
        ssl: true,
    };
    const adapter = new PrismaNeon(poolConfig);
    return new PrismaClient({ adapter });
}

async function sync() {
    console.log("🔗 Connecting to databases...");
    const dev = await createClient("postgresql://neondb_owner:npg_cDG14ueVwQnW@ep-patient-smoke-a9646xty-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require");
    const prod = await createClient("postgresql://neondb_owner:npg_cDG14ueVwQnW@ep-shy-fog-a9r6paag-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require");

    try {
        // List of tables to sync in order (respecting foreign keys)
        const tables = [
            'User',
            'Project',
            'ProjectMember',
            'Client',
            'Task',
            'TaskComment',
            'TaskAttachment',
            'Activity',
            'SearchLog',
            'Place',
            'SavedActivity'
        ];

        console.log("⚠️  WARNING: This will overwrite data in PROD.");
        console.log("Starting sync...");

        for (const table of tables) {
            // Prisma properties are usually modelName with first letter lowercased
            const prismaModel = table.charAt(0).toLowerCase() + table.slice(1);
            console.log(`\n📦 Syncing table: ${table} (using prisma.${prismaModel})...`);

            const model = (dev as any)[prismaModel];
            if (!model) {
                console.error(`❌ Model ${prismaModel} not found on Prisma client.`);
                continue;
            }

            try {
                // Fetch all from dev
                const data = await model.findMany();
                console.log(`   Found ${data.length} records in DEV.`);

                if (data.length === 0) continue;

                // Upsert into prod
                let count = 0;
                let failCount = 0;
                for (const item of data) {
                    try {
                        await (prod as any)[prismaModel].upsert({
                            where: { id: item.id || item.osmId },
                            update: item,
                            create: item
                        });
                        count++;
                        if (count % 50 === 0) process.stdout.write(".");
                    } catch (itemErr: any) {
                        failCount++;
                        // Don't log every single error if there are many, just the first few
                        if (failCount <= 3) {
                            console.error(`\n      ❌ Failed to sync record ${item.id || item.osmId}: ${itemErr.message.split('\n')[0]}`);
                        }
                    }
                }
                console.log(`\n   ✅ ${count} records synced (${failCount} failed).`);
            } catch (err: any) {
                if (err.code === 'P2021' || err.code === 'P2022') {
                    console.warn(`⚠️  Skipping table ${table}: Column mismatch or table missing in database.`);
                    console.warn(`   (Hint: Run 'npx prisma db push' on both branches to fix this)`);
                } else {
                    console.error(`❌ Error reading table ${table}:`, err.message);
                }
            }
        }

        console.log("\n✨ Database synchronization complete!");
    } catch (err) {
        console.error("\n❌ Sync failed:", err);
    } finally {
        await dev.$disconnect();
        await prod.$disconnect();
    }
}

sync();
