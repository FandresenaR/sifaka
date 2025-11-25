/**
 * Script de migration : Markdown Blog → PostgreSQL CMS
 * 
 * Ce script :
 * 1. Lit tous les fichiers .md dans /src/content/blog/
 * 2. Parse le frontmatter YAML
 * 3. Convertit le Markdown en HTML
 * 4. Crée les articles dans la base de données
 * 5. Lie les traductions via translation_key
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const sanitize = require('sanitize-html');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Chemin vers les fichiers Markdown (ajustez selon votre structure)
const BLOG_CONTENT_DIR = path.join(__dirname, '../src/content/blog');

async function convertMarkdownToHtml(markdown) {
  return marked(markdown);
}

async function migrateBlogPosts() {
  try {
    console.log('\n🚀 Début de la migration du blog...\n');
    
    // Vérifier que le dossier existe
    if (!fs.existsSync(BLOG_CONTENT_DIR)) {
      console.error(`❌ Dossier introuvable: ${BLOG_CONTENT_DIR}`);
      console.log('💡 Ajustez BLOG_CONTENT_DIR dans le script\n');
      return;
    }

    // Récupérer l'utilisateur admin (auteur des articles)
    const author = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!author) {
      console.error('❌ Aucun utilisateur ADMIN trouvé!');
      console.log('💡 Créez un compte admin d\'abord\n');
      return;
    }

    console.log(`✅ Auteur trouvé: ${author.email}\n`);

    // Lire tous les fichiers .md
    const files = fs.readdirSync(BLOG_CONTENT_DIR).filter(f => f.endsWith('.md'));
    console.log(`📚 ${files.length} fichiers Markdown trouvés\n`);

    // Map pour lier les traductions
    const translationMap = new Map();

    // Premier passage : créer tous les articles
    for (const file of files) {
      const filePath = path.join(BLOG_CONTENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Parser le frontmatter et le contenu
      const { data: frontmatter, content } = matter(fileContent);
      
      console.log(`📝 Traitement: ${frontmatter.title}`);
      
      // Convertir le Markdown en HTML
      const htmlContent = await convertMarkdownToHtml(content);
      const cleanHtml = sanitize(htmlContent, {
        allowedTags: [
          'h1','h2','h3','h4','h5','h6','p','ul','ol','li','strong','b','em','i','blockquote','hr','a','img','br'
        ],
        allowedAttributes: {
          a: ['href', 'title', 'target', 'rel'],
          img: ['src', 'alt', 'title']
        },
        transformTags: {
          'h3': (tagName, attribs) => ({ tagName: 'h2', attribs }),
        },
        allowedSchemesByTag: {
          a: ['http','https','mailto','tel'],
          img: ['http','https']
        }
      });
      
      // Générer un slug unique (nom du fichier sans extension)
      const baseSlug = path.basename(file, '.md');
      const slug = frontmatter.lang === 'en' ? `en-${baseSlug}` : baseSlug;
      
      // Créer l'article dans la DB
      const blogPost = await prisma.blogPost.create({
        data: {
          title: frontmatter.title,
          slug: slug,
          content: cleanHtml,
          excerpt: frontmatter.excerpt || '',
          coverImage: frontmatter.coverImage || null,
          published: true,
          tags: [frontmatter.category, frontmatter.lang].filter(Boolean), // Filter out undefined
          authorId: author.id,
          publishedAt: new Date(frontmatter.date),
        }
      });
      
      console.log(`   ✅ Créé: /blog/${slug}`);
      
      // Stocker dans la map pour lier les traductions après
      if (frontmatter.translation_key) {
        if (!translationMap.has(frontmatter.translation_key)) {
          translationMap.set(frontmatter.translation_key, {});
        }
        translationMap.get(frontmatter.translation_key)[frontmatter.lang] = {
          id: blogPost.id,
          slug: blogPost.slug,
          title: blogPost.title
        };
      }
    }

    console.log('\n📊 Résumé de la migration:');
    console.log(`   Articles créés: ${files.length}`);
    console.log(`   Groupes de traduction: ${translationMap.size}`);
    
    console.log('\n🔗 Liens de traduction détectés:');
    for (const [key, langs] of translationMap.entries()) {
      console.log(`\n   ${key}:`);
      if (langs.fr) console.log(`      FR: /blog/${langs.fr.slug} - "${langs.fr.title}"`);
      if (langs.en) console.log(`      EN: /blog/${langs.en.slug} - "${langs.en.title}"`);
    }

    console.log('\n✅ Migration terminée avec succès!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateBlogPosts();
