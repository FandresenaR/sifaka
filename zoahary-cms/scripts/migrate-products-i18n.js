/**
 * Script de migration des produits vers le système multilingue
 * 
 * Ce script :
 * 1. Ajoute les colonnes multilingues avec des valeurs par défaut
 * 2. Copie les données existantes vers titleFr et descriptionFr
 * 3. Ajoute des traductions anglaises génériques
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Traductions manuelles des 6 produits existants
const translations = {
  "Huile de Baobab Bio": {
    titleEn: "Organic Baobab Oil",
    descriptionEn: "Pure cold-pressed baobab oil, 100% organic. Rich in vitamins A, D, E, and F. Perfect for skin and hair care.",
    slugEn: "organic-baobab-oil"
  },
  "Poudre de Baobab Pure": {
    titleEn: "Pure Baobab Powder",
    descriptionEn: "Natural baobab fruit powder. Excellent source of vitamin C, fiber, and antioxidants. Ideal for smoothies and pastries.",
    slugEn: "pure-baobab-powder"
  },
  "Miel de Baobab": {
    titleEn: "Baobab Honey",
    descriptionEn: "Pure honey harvested from baobab flowers. Unique taste with floral notes. Natural antioxidant properties.",
    slugEn: "baobab-honey"
  },
  "Muesli au Baobab": {
    titleEn: "Baobab Muesli",
    descriptionEn: "Energy-boosting muesli with baobab powder, oats, dried fruits, and local seeds. Perfect for breakfast.",
    slugEn: "baobab-muesli"
  },
  "Pâte de Fruits de Baobab": {
    titleEn: "Baobab Fruit Paste",
    descriptionEn: "Natural fruit paste made from baobab pulp. Sweet and tangy taste, rich in vitamin C. Great as spread or in desserts.",
    slugEn: "baobab-fruit-paste"
  },
  "Savon de Baobab Bio": {
    titleEn: "Organic Baobab Soap",
    descriptionEn: "Natural handmade soap with baobab oil. Gentle cleansing, moisturizing for all skin types.",
    slugEn: "organic-baobab-soap"
  }
};

async function main() {
  console.log("🌍 Migration des produits vers système multilingue...\n");

  // Utiliser SQL brut pour ajouter les colonnes
  try {
    await prisma.$executeRaw`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "titleFr" TEXT,
      ADD COLUMN IF NOT EXISTS "titleEn" TEXT,
      ADD COLUMN IF NOT EXISTS "descriptionFr" TEXT,
      ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT,
      ADD COLUMN IF NOT EXISTS "slugEn" TEXT;
    `;
    console.log("✅ Colonnes ajoutées");
  } catch (error) {
    console.log("⚠️  Colonnes déjà existantes, on continue...");
  }

  // Récupérer tous les produits
  const products = await prisma.$queryRaw`
    SELECT id, title, description, slug FROM "Product"
  `;

  console.log(`📦 ${products.length} produits trouvés\n`);

  for (const product of products) {
    const translation = translations[product.title];

    if (!translation) {
      console.log(`⚠️  Pas de traduction pour: ${product.title}`);
      // Utiliser le titre français comme fallback
      await prisma.$executeRaw`
        UPDATE "Product"
        SET 
          "titleFr" = ${product.title},
          "titleEn" = ${product.title},
          "descriptionFr" = ${product.description},
          "descriptionEn" = ${product.description}
        WHERE id = ${product.id}
      `;
      continue;
    }

    // Mettre à jour avec les traductions
    await prisma.$executeRaw`
      UPDATE "Product"
      SET 
        "titleFr" = ${product.title},
        "titleEn" = ${translation.titleEn},
        "descriptionFr" = ${product.description},
        "descriptionEn" = ${translation.descriptionEn},
        "slugEn" = ${translation.slugEn}
      WHERE id = ${product.id}
    `;

    console.log(`✅ ${product.title} → ${translation.titleEn}`);
  }

  // Rendre les colonnes NOT NULL maintenant qu'elles ont des valeurs
  await prisma.$executeRaw`
    ALTER TABLE "Product" 
    ALTER COLUMN "titleFr" SET NOT NULL,
    ALTER COLUMN "titleEn" SET NOT NULL,
    ALTER COLUMN "descriptionFr" SET NOT NULL,
    ALTER COLUMN "descriptionEn" SET NOT NULL;
  `;
  console.log("\n✅ Colonnes définies comme NOT NULL");

  // Supprimer les anciennes colonnes
  await prisma.$executeRaw`
    ALTER TABLE "Product" 
    DROP COLUMN IF EXISTS "title",
    DROP COLUMN IF EXISTS "description";
  `;
  console.log("✅ Anciennes colonnes supprimées");

  console.log("\n🎉 Migration terminée !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
