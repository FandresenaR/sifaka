import { PrismaClient, UserRole, ProjectStatus, TaskStatus, Priority, MemberRole } from '@prisma/client';

import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, PoolConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = "password";

// Setup connection string parsing and adapter
const connectionString = process.env.DATABASE_URL;
let poolConfig: PoolConfig;

if (process.env.NEON_HOST && process.env.NEON_USER && process.env.NEON_PASSWORD && process.env.NEON_DATABASE) {
    poolConfig = {
        host: process.env.NEON_HOST,
        database: process.env.NEON_DATABASE,
        user: process.env.NEON_USER,
        password: process.env.NEON_PASSWORD,
        ssl: true,
        max: 1,
    };
} else if (connectionString) {
    const urlKey = new URL(connectionString);
    poolConfig = {
        host: urlKey.hostname,
        database: urlKey.pathname.replace(/^\//, ""),
        user: urlKey.username,
        password: urlKey.password,
        ssl: true,
        max: 1
    };
} else {
    throw new Error("Missing database configuration for seeding");
}

const adapter = new PrismaNeon(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sifaka.com' },
        update: {},
        create: {
            email: 'admin@sifaka.com',
            name: 'Admin User',
            role: UserRole.ADMIN,
        },
    });

    console.log('✅ Created admin user:', admin.email);

    // Create team members
    const john = await prisma.user.upsert({
        where: { email: 'john@sifaka.com' },
        update: {},
        create: {
            email: 'john@sifaka.com',
            name: 'John Doe',
            role: UserRole.USER,
        },
    });

    const jane = await prisma.user.upsert({
        where: { email: 'jane@sifaka.com' },
        update: {},
        create: {
            email: 'jane@sifaka.com',
            name: 'Jane Smith',
            role: UserRole.MANAGER,
        },
    });

    console.log('✅ Created team members');

    // Create "Shuffle Life" project
    const shuffleLife = await prisma.project.upsert({
        where: { slug: 'shuffle-life' },
        update: {},
        create: {
            name: 'Shuffle Life',
            slug: 'shuffle-life',
            description: 'A revolutionary life management and productivity platform',
            status: ProjectStatus.ACTIVE,
            color: '#6366f1',
            startDate: new Date('2025-01-01'),
            budget: 50000,
        },
    });

    console.log('✅ Created "Shuffle Life" project');

    // Add project members
    await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId: shuffleLife.id,
                userId: admin.id,
            },
        },
        update: {},
        create: {
            projectId: shuffleLife.id,
            userId: admin.id,
            role: MemberRole.OWNER,
        },
    });

    await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId: shuffleLife.id,
                userId: jane.id,
            },
        },
        update: {},
        create: {
            projectId: shuffleLife.id,
            userId: jane.id,
            role: MemberRole.ADMIN,
        },
    });

    await prisma.projectMember.upsert({
        where: {
            projectId_userId: {
                projectId: shuffleLife.id,
                userId: john.id,
            },
        },
        update: {},
        create: {
            projectId: shuffleLife.id,
            userId: john.id,
            role: MemberRole.MEMBER,
        },
    });

    console.log('✅ Added project members');

    // Create sample tasks for Shuffle Life
    const tasks = [
        {
            title: 'Design user interface mockups',
            description: 'Create high-fidelity mockups for the main dashboard and task management views',
            status: TaskStatus.IN_PROGRESS,
            priority: Priority.HIGH,
            assigneeId: jane.id,
            dueDate: new Date('2025-02-15'),
            tags: ['design', 'ui/ux'],
        },
        {
            title: 'Set up authentication system',
            description: 'Implement Supabase authentication with email/password and social logins',
            status: TaskStatus.TODO,
            priority: Priority.URGENT,
            assigneeId: john.id,
            dueDate: new Date('2025-02-01'),
            tags: ['backend', 'auth'],
        },
        {
            title: 'Create database schema',
            description: 'Design and implement the database schema for users, projects, and tasks',
            status: TaskStatus.DONE,
            priority: Priority.HIGH,
            assigneeId: admin.id,
            completedAt: new Date(),
            tags: ['backend', 'database'],
        },
        {
            title: 'Implement task board (Kanban)',
            description: 'Build drag-and-drop Kanban board for task management',
            status: TaskStatus.TODO,
            priority: Priority.MEDIUM,
            assigneeId: jane.id,
            dueDate: new Date('2025-02-20'),
            tags: ['frontend', 'features'],
        },
        {
            title: 'Write API documentation',
            description: 'Document all REST API endpoints with examples and response schemas',
            status: TaskStatus.TODO,
            priority: Priority.LOW,
            tags: ['documentation'],
        },
    ];

    for (const [index, taskData] of tasks.entries()) {
        await prisma.task.create({
            data: {
                ...taskData,
                projectId: shuffleLife.id,
                createdById: admin.id,
                order: index,
            },
        });
    }

    console.log('✅ Created sample tasks');

    // Create sample clients
    const clients = [
        {
            name: 'Acme Corporation',
            email: 'contact@acme.com',
            phone: '+1 (555) 123-4567',
            company: 'Acme Corp',
            position: 'CEO',
            city: 'New York',
            country: 'USA',
            website: 'https://acme.com',
            notes: 'Interested in enterprise plan',
            projectId: shuffleLife.id,
            createdById: admin.id,
        },
        {
            name: 'TechStart Inc',
            email: 'hello@techstart.io',
            phone: '+1 (555) 987-6543',
            company: 'TechStart',
            position: 'CTO',
            city: 'San Francisco',
            country: 'USA',
            website: 'https://techstart.io',
            notes: 'Early adopter, looking for custom integration',
            projectId: shuffleLife.id,
            createdById: jane.id,
        },
    ];

    for (const clientData of clients) {
        await prisma.client.create({
            data: clientData,
        });
    }

    console.log('✅ Created sample clients');

    console.log('🎉 Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
