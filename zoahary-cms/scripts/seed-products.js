const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ajout des produits Zoahary Baobab...\n');

  // Récupérer le super admin (fandresenar6@gmail.com)
  const admin = await prisma.user.findUnique({
    where: { email: 'fandresenar6@gmail.com' }
  });

  if (!admin) {
    console.error('❌ Super admin introuvable. Veuillez d\'abord créer l\'utilisateur.');
    process.exit(1);
  }

  const products = [
    {
      title: 'Huile de Baobab Bio',
      slug: 'huile-de-baobab-bio',
      description: 'Huile pressée à froid, riche en vitamines et acides gras essentiels. Idéale pour la peau et les cheveux.',
      price: 45000,
      images: ['/images/HuileBaobab.webp'],
      category: 'Huile de Baobab',
      inStock: true,
      featured: true,
      authorId: admin.id,
    },
    {
      title: 'Poudre de Baobab Pure',
      slug: 'poudre-de-baobab-pure',
      description: 'Supplément nutritionnel riche en fibres, calcium et vitamine C. Parfait pour smoothies et pâtisseries.',
      price: 25000,
      images: ['/images/PoudreBaobab.webp'],
      category: 'Poudre de Baobab',
      inStock: true,
      featured: true,
      authorId: admin.id,
    },
    {
      title: 'Miel de Baobab',
      slug: 'miel-de-baobab',
      description: 'Un miel rare et délicat, issu des fleurs majestueuses du baobab. Naturellement sucrant et riche en oligo-éléments, il offre une source d\'énergie saine. Il est également réputé pour ses vertus apaisantes et ses propriétés antibactériennes, idéal pour adoucir la gorge.',
      price: 35000,
      images: ['/images/MielBaobab.webp'],
      category: 'Autres',
      inStock: true,
      featured: true,
      authorId: admin.id,
    },
    {
      title: 'Muesli au Baobab',
      slug: 'muesli-au-baobab',
      description: 'Petit déjeuner sain à base de flocons de riz soufflée, chocolat et poudre de baobab. Riche en fibres et antioxydants. Idéale pour les sportifs et les enfants.',
      price: 18000,
      images: ['/images/Muesli.jpg'],
      category: 'Compléments Alimentaires',
      inStock: true,
      featured: false,
      authorId: admin.id,
    },
    {
      title: 'Pâte de Fruits de Baobab',
      slug: 'pate-de-fruits-de-baobab',
      description: 'Pâte de fruits artisanale à base de pulpe de baobab, sucre et aromatisée au gingembre. Délicieuse et nutritive.',
      price: 8000,
      images: ['/images/PateFruit.jpg'],
      category: 'Autres',
      inStock: true,
      featured: false,
      authorId: admin.id,
    },
    {
      title: 'Savon de Baobab Bio',
      slug: 'savon-de-baobab-bio',
      description: 'Savon artisanal à base d\'huile de baobab, doux et hydratant pour tous types de peau. Naturel et sans additifs chimiques.',
      price: 12000,
      images: ['/images/SavonBaobab.webp'],
      category: 'Cosmétiques',
      inStock: true,
      featured: false,
      authorId: admin.id,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });
    console.log(`✅ Produit créé: ${product.title} (${product.price} Ar)`);
  }

  console.log('\n🎉 Tous les produits ont été ajoutés avec succès !');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
