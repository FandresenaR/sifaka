# Sifaka CMS v0.2.0 - Multi-Tenant Architecture

**Release Date**: December 8, 2024  
**Version**: 0.2.0  
**Code Name**: Multi-Tenant Foundation

---

## 🎯 Overview

Version 0.2.0 introduces a **project-based multi-tenant architecture**, allowing users to create multiple isolated CMS projects, each with its own products, blog posts, and media library.

## ✨ Key Features

### 1. Project Management
- **Create unlimited projects** per user account
- **Project types**: E-commerce, Blog, Portfolio, Landing Page, Custom
- **Status management**: Active, Draft, Archived
- **Module configuration**: Enable/disable features per project

### 2. Data Isolation
- Each project has **isolated Products**
- Each project has **isolated Blog Posts**
- **Media** can be project-specific or shared across projects
- Automatic filtering by `projectId` in all APIs

### 3. User Interface
- `/admin/projects` - Visual project listing with cards
- `/admin/projects/[slug]` - Project settings and configuration
- Dashboard module for quick access
- Real-time project statistics

### 4. API Enhancements
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[slug]` - Get project details
- `PATCH /api/projects/[slug]` - Update project
- `DELETE /api/projects/[slug]` - Delete project (cascade)

## 📊 Database Schema

### New Models

```prisma
model Project {
  id          String        @id @default(cuid())
  name        String
  slug        String        @unique
  type        ProjectType   // ECOMMERCE, BLOG, PORTFOLIO, LANDING, CUSTOM
  description String?
  status      ProjectStatus // ACTIVE, ARCHIVED, DRAFT
  modules     Json?         // Feature configuration
  ownerId     String
  
  owner       User          @relation(...)
  products    Product[]
  blogPosts   BlogPost[]
  media       Media[]
}
```

### Modified Models

```prisma
model Product {
  projectId String  // ✨ NEW - Required
  project   Project @relation(...)
}

model BlogPost {
  projectId String  // ✨ NEW - Required
  project   Project @relation(...)
}

model Media {
  projectId String?  // ✨ NEW - Optional (shared media)
  project   Project? @relation(...)
}
```

## 🔄 Migration Path

### Automated Migration

```bash
cd apps/web
npx tsx scripts/migrate-to-projects.ts
```

### Manual Migration

See [MIGRATION_GUIDE_v0.2.0.md](./MIGRATION_GUIDE_v0.2.0.md) for detailed SQL commands.

## 🐛 Bug Fixes

1. **Foreign Key Violations**: Fixed user creation on OAuth sign-in
2. **API Schema Sync**: Added migration script for Neon WebSocket deployments
3. **Missing Columns**: Auto-added `supabaseId`, `avatar`, `lastLoginAt` to API User table
4. **Session Management**: Proper user record creation with NextAuth PrismaAdapter

## ⚠️ Breaking Changes

### Database
- `Product.projectId` is now **required**
- `BlogPost.projectId` is now **required**
- Existing products/posts must be assigned to a project

### API
- All content creation endpoints now require `projectId` parameter
- Filter query parameter `projectId` available on list endpoints

### Code
- Prisma client regeneration required: `npx prisma generate`
- Database migration required: `npx prisma migrate deploy`

## 📚 Documentation Updates

- ✅ [README.md](./README.md) - Updated with multi-tenant architecture
- ✅ [CHANGELOG.md](./CHANGELOG.md) - Full version history
- ✅ [MIGRATION_GUIDE_v0.2.0.md](./MIGRATION_GUIDE_v0.2.0.md) - Detailed migration steps
- ✅ [apps/web/README.md](./apps/web/README.md) - CMS-specific documentation

## 🎨 UI/UX Improvements

- Project cards with visual type indicators (🛍️ 📝 💼 🚀 ⚙️)
- Status badges with color coding (Active, Draft, Archived)
- Enhanced delete button visibility (red background)
- Real-time project count in dashboard

## 🔐 Security

- Role-based access: Only project owners and super admins can modify projects
- Cascade deletion: Deleting a project removes all associated content
- Super admin email hardcoded: `fandresenar6@gmail.com`

## 🚀 Performance

- Indexed `projectId` on all content tables
- Efficient queries with `@@index([projectId])`
- Lazy loading of project relationships

## 📈 Next Steps (Future Releases)

- [ ] Project collaboration (invite team members)
- [ ] Project templates
- [ ] Bulk import/export per project
- [ ] Project analytics dashboard
- [ ] API rate limiting per project
- [ ] Custom domains per project

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📝 License

[MIT License](./LICENSE)

---

**Upgrade Now**: `git pull && npm install && npx tsx apps/web/scripts/migrate-to-projects.ts`
