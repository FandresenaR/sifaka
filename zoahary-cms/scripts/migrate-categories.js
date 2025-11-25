const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mappage des anciennes catégories vers les nouvelles
const CATEGORY_MAPPING = {
  "Poudre de Baobab": "Produits de Consommation",
  "Huile de Baobab": "Produits de Consommation",
  "Graines de Baobab": "Produits de Consommation",
  "Feuilles de Baobab": "Produits de Consommation",
  "Cosmétiques": "Cosmétiques",
  "Compléments Alimentaires": "Produits de Consommation",
  "Autres": "Autres"
};

async function main() {
  console.log('🔄 Migration des catégories de produits...\n');

  const products = await prisma.product.findMany();
  
  let updatedCount = 0;
  
  for (const product of products) {
    const newCategory = CATEGORY_MAPPING[product.category];
    
    if (newCategory && newCategory !== product.category) {
      await prisma.product.update({
        where: { id: product.id },
        data: { category: newCategory }
      });
      
      console.log(`✅ ${product.title}: "${product.category}" → "${newCategory}"`);
      updatedCount++;
    } else if (!newCategory) {
      // Si catégorie inconnue, mettre "Autres"
      await prisma.product.update({
        where: { id: product.id },
        data: { category: "Autres" }
      });
      
      console.log(`⚠️  ${product.title}: "${product.category}" → "Autres" (catégorie inconnue)`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Migration terminée ! ${updatedCount} produit(s) mis à jour.`);
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
