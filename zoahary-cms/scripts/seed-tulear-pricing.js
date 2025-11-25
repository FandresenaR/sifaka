const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Création de la règle de tarification Tuléar...\n");

  // Supprimer les règles existantes avec le même nom
  const existingRule = await prisma.pricingRule.findFirst({
    where: { name: "Réduction Tuléar" },
  });

  if (existingRule) {
    console.log("🗑️ Suppression de la règle existante...");
    await prisma.pricingRule.delete({
      where: { id: existingRule.id },
    });
  }

  // Récupérer les produits existants
  const products = await prisma.product.findMany({
    select: { id: true, titleFr: true, slug: true, price: true },
  });

  if (products.length === 0) {
    console.log("❌ Aucun produit trouvé. Exécutez d'abord seed-products.js");
    return;
  }

  // Définir les réductions par produit (slug → prix réduit)
  const tulearDiscounts = {
    "poudre-de-baobab-pure": 38000,
    "pate-de-fruits-de-baobab": 2500,
    "huile-de-baobab-bio": 38000,
    "savon-de-baobab-bio": 7000,
    "muesli-au-baobab": 13000,
    "miel-de-baobab": 20000,
  };

  // Créer la règle
  const rule = await prisma.pricingRule.create({
    data: {
      name: "Réduction Tuléar",
      enabled: true,
      priority: 10,
      geoCities: ["Toliara", "Tuléar", "Toliary"],
      geoRegions: ["Atsimo-Andrefana"],
      startDate: null, // Toujours actif
      endDate: null,
      products: {
        create: products
          .filter((p) => tulearDiscounts[p.slug])
          .map((p) => ({
            productId: p.id,
            discountType: "FIXED",
            discountValue: tulearDiscounts[p.slug],
          })),
      },
    },
    include: {
      products: true,
    },
  });

  console.log(`✅ Règle créée: ${rule.name}`);
  console.log(`   ID: ${rule.id}`);
  console.log(`   Villes: ${rule.geoCities.join(", ")}`);
  console.log(`   Produits concernés: ${rule.products.length}\n`);

  // Récupérer les détails des produits pour l'affichage
  const productDetails = await prisma.product.findMany({
    where: {
      id: { in: rule.products.map(rp => rp.productId) },
    },
    select: { id: true, titleFr: true, price: true },
  });

  rule.products.forEach((rp) => {
    const product = productDetails.find(p => p.id === rp.productId);
    if (product) {
      const discount = product.price - rp.discountValue;
      console.log(
        `   • ${product.titleFr}: ${product.price.toLocaleString()} Ar → ${rp.discountValue.toLocaleString()} Ar (${discount.toLocaleString()} Ar de réduction)`
      );
    }
  });

  console.log("\n🎉 Règle de tarification Tuléar créée avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });