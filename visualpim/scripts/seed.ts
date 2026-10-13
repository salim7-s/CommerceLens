import { getDatabase } from "../src/adapters/repo/sqlite/database";
import { SqliteCategoryRepository } from "../src/adapters/repo/sqlite/categoryRepo";
import { SqliteProductRepository } from "../src/adapters/repo/sqlite/productRepo";
import { computeHealth } from "../src/domain/health";
import { Product } from "../src/domain/schemas";

async function seed() {
  console.log("🌱 Initializing CommerceLens SQLite database and seeding demo catalog...");
  getDatabase();
  const categoryRepo = new SqliteCategoryRepository();
  const productRepo = new SqliteProductRepository();

  // 1. Seed Categories & Attribute Templates
  const categoriesData = [
    {
      id: "cat_footwear",
      name: "Footwear",
      woo_id: 11,
      templates: [
        { id: "tmpl_fw_size", category_id: "cat_footwear", name: "size", type: "text" as const, required: true, options: [] },
        { id: "tmpl_fw_color", category_id: "cat_footwear", name: "color", type: "text" as const, required: true, options: [] },
        { id: "tmpl_fw_material", category_id: "cat_footwear", name: "material", type: "text" as const, required: true, options: [] },
        { id: "tmpl_fw_gender", category_id: "cat_footwear", name: "gender", type: "select" as const, required: true, options: ["Men", "Women", "Unisex"] },
        { id: "tmpl_fw_sole", category_id: "cat_footwear", name: "sole_type", type: "text" as const, required: false, options: [] },
      ],
    },
    {
      id: "cat_apparel",
      name: "Apparel",
      woo_id: 12,
      templates: [
        { id: "tmpl_ap_size", category_id: "cat_apparel", name: "size", type: "select" as const, required: true, options: ["XS", "S", "M", "L", "XL", "XXL"] },
        { id: "tmpl_ap_color", category_id: "cat_apparel", name: "color", type: "text" as const, required: true, options: [] },
        { id: "tmpl_ap_fabric", category_id: "cat_apparel", name: "fabric", type: "text" as const, required: true, options: [] },
        { id: "tmpl_ap_fit", category_id: "cat_apparel", name: "fit", type: "select" as const, required: false, options: ["Slim", "Regular", "Relaxed"] },
      ],
    },
    {
      id: "cat_electronics",
      name: "Electronics",
      woo_id: 13,
      templates: [
        { id: "tmpl_el_brand", category_id: "cat_electronics", name: "brand", type: "text" as const, required: true, options: [] },
        { id: "tmpl_el_model", category_id: "cat_electronics", name: "model", type: "text" as const, required: true, options: [] },
        { id: "tmpl_el_warranty", category_id: "cat_electronics", name: "warranty", type: "text" as const, required: true, options: [] },
        { id: "tmpl_el_voltage", category_id: "cat_electronics", name: "voltage", type: "text" as const, required: false, options: [] },
      ],
    },
  ];

  for (const cat of categoriesData) {
    await categoryRepo.saveCategory({ id: cat.id, name: cat.name, woo_id: cat.woo_id });
    for (const tmpl of cat.templates) {
      await categoryRepo.saveTemplate(tmpl);
    }
  }
  console.log("✅ Seeded 3 categories with attribute templates (Footwear, Apparel, Electronics)");

  // Real ecommerce catalog photography
  const shoePhoto = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";
  const backpackPhoto = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80";
  const headphonesPhoto = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";
  const skatePhoto = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80";

  // Catalog Products
  const fwTemplates = await categoryRepo.getTemplates("cat_footwear");
  const apTemplates = await categoryRepo.getTemplates("cat_apparel");
  const elTemplates = await categoryRepo.getTemplates("cat_electronics");

  // Product 1: Footwear - Needs Enrichment
  const shoeRaw: Partial<Product> = {
    id: "prod_shoe_001",
    sku: "NK-AM-IMP-001",
    name: "Nike Air Max Impact Sneakers",
    category_id: "cat_footwear",
    price: 119.99,
    description: "Low-top athletic shoes with responsive air cushioning.",
    alt_text: "",
    seo_tags: [],
    image_public_id: "nike_air_max_impact",
    image_url: shoePhoto,
    sync_status: "none",
    attributes: {
      color: "Red",
    },
  };
  const shoeHealth = computeHealth(shoeRaw, fwTemplates);
  const shoeProduct: Product = {
    ...shoeRaw,
    health_score: shoeHealth.score,
    status: shoeHealth.status,
  } as Product;
  await productRepo.save(shoeProduct);
  console.log(`Initialized Product: '${shoeProduct.name}' (Score: ${shoeProduct.health_score}, Status: ${shoeProduct.status})`);

  // Product 2: Apparel / Gear - Partial Attributes
  const packRaw: Partial<Product> = {
    id: "prod_pack_002",
    sku: "PAT-ARB-20L-GRY",
    name: "Patagonia Arbor Daypack 20L Water-Repellent Backpack",
    category_id: "cat_apparel",
    price: 89.00,
    description: "Lightweight and versatile daily pack made from 100% recycled polyester with a durable water-repellent (DWR) finish. Features a padded laptop sleeve holding up to 15-inch devices.",
    alt_text: "Patagonia Arbor 20L daypack backpack in slate gray",
    seo_tags: ["patagonia backpack", "recycled daypack", "travel bag"],
    image_public_id: "patagonia_arbor_20l",
    image_url: backpackPhoto,
    sync_status: "none",
    attributes: {
      size: "M",
      color: "Slate Gray",
      fabric: "Recycled Polyester",
      fit: "Regular",
    },
  };
  const packHealth = computeHealth(packRaw, apTemplates);
  const packProduct: Product = {
    ...packRaw,
    health_score: packHealth.score,
    status: packHealth.status,
  } as Product;
  await productRepo.save(packProduct);
  console.log(`Initialized Product: '${packProduct.name}' (Score: ${packProduct.health_score}, Status: ${packProduct.status})`);

  // Product 3: Electronics - Complete Listing (Score 100)
  const phoneRaw: Partial<Product> = {
    id: "prod_phone_003",
    sku: "SNY-WH-XM5-BLK",
    name: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
    category_id: "cat_electronics",
    price: 399.99,
    description: "Industry-leading active noise cancellation powered by two dedicated processors and eight microphones. Features Auto NC Optimizer, 30-hour battery life with rapid USB-PD charging, and hands-free Speak-to-Chat voice control.",
    alt_text: "Sony WH-1000XM5 wireless over-ear noise-canceling headphones in matte black",
    seo_tags: ["sony wh-1000xm5", "noise canceling headphones", "wireless audio", "over ear headphones"],
    image_public_id: "sony_wh_1000xm5",
    image_url: headphonesPhoto,
    sync_status: "none",
    attributes: {
      brand: "Sony",
      model: "WH-1000XM5",
      warranty: "1 Year Official",
      voltage: "5V USB-C",
    },
  };
  const phoneHealth = computeHealth(phoneRaw, elTemplates);
  const phoneProduct: Product = {
    ...phoneRaw,
    health_score: phoneHealth.score,
    status: phoneHealth.status,
  } as Product;
  await productRepo.save(phoneProduct);
  console.log(`Initialized Product: '${phoneProduct.name}' (Score: ${phoneProduct.health_score}, Status: ${phoneProduct.status})`);

  // Product 4: Footwear - Classic Skate
  const skateRaw: Partial<Product> = {
    id: "prod_skate_004",
    sku: "VN-OLD-SKL-004",
    name: "Vans Old Skool Classic Skate Shoes",
    category_id: "cat_footwear",
    price: 75.00,
    description: "Heritage low-top skate shoes featuring durable canvas uppers, reinforced toe caps, and signature rubber waffle outsoles.",
    alt_text: "Vans Old Skool low-top skate shoes in classic black and white",
    seo_tags: ["vans old skool", "skate shoes", "canvas sneakers", "low top shoes"],
    image_public_id: "vans_old_skool",
    image_url: skatePhoto,
    sync_status: "none",
    attributes: {
      color: "Black / White",
      size: "9.5",
      material: "Canvas & Suede",
      gender: "Unisex",
      sole_type: "Waffle Rubber",
    },
  };
  const skateHealth = computeHealth(skateRaw, fwTemplates);
  const skateProduct: Product = {
    ...skateRaw,
    health_score: skateHealth.score,
    status: skateHealth.status,
  } as Product;
  await productRepo.save(skateProduct);
  console.log(`Initialized Product: '${skateProduct.name}' (Score: ${skateProduct.health_score}, Status: ${skateProduct.status})`);

  console.log("Database initialized. CommerceLens catalog ready with active inventory.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
