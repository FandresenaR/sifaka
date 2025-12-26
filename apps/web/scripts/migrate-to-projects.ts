import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting data migration to multi-tenant projects...\n')

  // 1. Check existing projects
  const existingProjects = await prisma.project.count()
  console.log(`📊 Found ${existingProjects} existing project(s)`)

  let defaultProject: any

  if (existingProjects === 0) {
    console.log('\n⚠️  No projects found. You need to create one first.')
    console.log('Please sign in to the app and create a project from /admin')
    console.log('Then run this migration script again.')
    process.exit(1)
  } else {
    // Use first project as default
    defaultProject = await prisma.project.findFirst({
      orderBy: { createdAt: 'asc' },
    })
    console.log(`✅ Using project "${defaultProject.name}" (${defaultProject.id}) as default\n`)
  }

  // 2. Count orphaned content
  const orphanedProducts = await prisma.product.count({
    where: { projectId: { equals: null } },
  })
  const orphanedPosts = await prisma.blogPost.count({
    where: { projectId: { equals: null } },
  })
  const orphanedMedia = await prisma.media.count({
    where: { projectId: { equals: null } },
  })

  console.log('📦 Orphaned content found:')
  console.log(`   Products:   ${orphanedProducts}`)
  console.log(`   Blog Posts: ${orphanedPosts}`)
  console.log(`   Media:      ${orphanedMedia}\n`)

  if (orphanedProducts === 0 && orphanedPosts === 0 && orphanedMedia === 0) {
    console.log('✨ All content is already assigned to projects!')
    console.log('No migration needed.')
    process.exit(0)
  }

  // 3. Migrate products
  if (orphanedProducts > 0) {
    console.log('🔄 Migrating products...')
    const updatedProducts = await prisma.product.updateMany({
      where: { projectId: { equals: null } },
      data: { projectId: defaultProject.id },
    })
    console.log(`   ✅ Assigned ${updatedProducts.count} products to "${defaultProject.name}"`)
  }

  // 4. Migrate blog posts
  if (orphanedPosts > 0) {
    console.log('🔄 Migrating blog posts...')
    const updatedPosts = await prisma.blogPost.updateMany({
      where: { projectId: { equals: null } },
      data: { projectId: defaultProject.id },
    })
    console.log(`   ✅ Assigned ${updatedPosts.count} blog posts to "${defaultProject.name}"`)
  }

  // 5. Migrate media (optional - leave as shared)
  if (orphanedMedia > 0) {
    console.log('🔄 Media files can remain shared (projectId = null)')
    console.log('   Or assign them to the default project? (y/n)')
    
    // For automated script, we'll leave media as shared
    console.log('   ℹ️  Leaving media as shared (accessible to all projects)')
  }

  // 6. Verify migration
  console.log('\n🔍 Verifying migration...')
  const remainingOrphanedProducts = await prisma.product.count({
    where: { projectId: { equals: null } },
  })
  const remainingOrphanedPosts = await prisma.blogPost.count({
    where: { projectId: { equals: null } },
  })

  if (remainingOrphanedProducts === 0 && remainingOrphanedPosts === 0) {
    console.log('✅ Migration successful!')
    console.log('\n📊 Final status:')
    console.log(`   All products assigned: ✓`)
    console.log(`   All blog posts assigned: ✓`)
    console.log(`   Media files: ${orphanedMedia} shared`)
  } else {
    console.log('❌ Migration incomplete:')
    console.log(`   Orphaned products: ${remainingOrphanedProducts}`)
    console.log(`   Orphaned blog posts: ${remainingOrphanedPosts}`)
    process.exit(1)
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
