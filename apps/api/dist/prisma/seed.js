"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../src/generated/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sifaka.com' },
        update: {},
        create: {
            email: 'admin@sifaka.com',
            name: 'Admin User',
            role: client_1.UserRole.ADMIN,
        },
    });
    console.log('✅ Created admin user:', admin.email);
    const john = await prisma.user.upsert({
        where: { email: 'john@sifaka.com' },
        update: {},
        create: {
            email: 'john@sifaka.com',
            name: 'John Doe',
            role: client_1.UserRole.USER,
        },
    });
    const jane = await prisma.user.upsert({
        where: { email: 'jane@sifaka.com' },
        update: {},
        create: {
            email: 'jane@sifaka.com',
            name: 'Jane Smith',
            role: client_1.UserRole.MANAGER,
        },
    });
    console.log('✅ Created team members');
    const shuffleLife = await prisma.project.upsert({
        where: { slug: 'shuffle-life' },
        update: {},
        create: {
            name: 'Shuffle Life',
            slug: 'shuffle-life',
            description: 'A revolutionary life management and productivity platform',
            status: client_1.ProjectStatus.ACTIVE,
            color: '#6366f1',
            startDate: new Date('2025-01-01'),
            budget: 50000,
        },
    });
    console.log('✅ Created "Shuffle Life" project');
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
            role: client_1.MemberRole.OWNER,
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
            role: client_1.MemberRole.ADMIN,
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
            role: client_1.MemberRole.MEMBER,
        },
    });
    console.log('✅ Added project members');
    const tasks = [
        {
            title: 'Design user interface mockups',
            description: 'Create high-fidelity mockups for the main dashboard and task management views',
            status: client_1.TaskStatus.IN_PROGRESS,
            priority: client_1.Priority.HIGH,
            assigneeId: jane.id,
            dueDate: new Date('2025-02-15'),
            tags: ['design', 'ui/ux'],
        },
        {
            title: 'Set up authentication system',
            description: 'Implement Supabase authentication with email/password and social logins',
            status: client_1.TaskStatus.TODO,
            priority: client_1.Priority.URGENT,
            assigneeId: john.id,
            dueDate: new Date('2025-02-01'),
            tags: ['backend', 'auth'],
        },
        {
            title: 'Create database schema',
            description: 'Design and implement the database schema for users, projects, and tasks',
            status: client_1.TaskStatus.DONE,
            priority: client_1.Priority.HIGH,
            assigneeId: admin.id,
            completedAt: new Date(),
            tags: ['backend', 'database'],
        },
        {
            title: 'Implement task board (Kanban)',
            description: 'Build drag-and-drop Kanban board for task management',
            status: client_1.TaskStatus.TODO,
            priority: client_1.Priority.MEDIUM,
            assigneeId: jane.id,
            dueDate: new Date('2025-02-20'),
            tags: ['frontend', 'features'],
        },
        {
            title: 'Write API documentation',
            description: 'Document all REST API endpoints with examples and response schemas',
            status: client_1.TaskStatus.TODO,
            priority: client_1.Priority.LOW,
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
//# sourceMappingURL=seed.js.map