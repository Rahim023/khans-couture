import Product from "../models/Products.js";

const normalizeSection = (value) => {
  if (!value) return "discover";

  const trimmed = String(value).trim().toLowerCase();

  if (["kurti", "kurti collection", "kurtis"].includes(trimmed)) return "kurti";
  if (["wedding", "bridal", "wedding collection"].includes(trimmed)) return "wedding";
  if (["signature", "signature series"].includes(trimmed)) return "signature";
  if (["discover", "curated", "discover collection"].includes(trimmed)) return "discover";

  return trimmed;
};

const inferSections = (p) => {
  const list = [];

  const explicit = Array.isArray(p.sections) ? p.sections : [];
  explicit.forEach((entry) => {
    const normalized = normalizeSection(entry);
    if (normalized && !list.includes(normalized)) list.push(normalized);
  });

  if (p.section) {
    const normalized = normalizeSection(p.section);
    if (normalized && !list.includes(normalized)) list.push(normalized);
  }

  if (p.Wedding) list.push("wedding");
  if (p.Signature) list.push("signature");
  if (p.Discover) list.push("discover");
  if (p.kurti || p.Kurti) list.push("kurti");

  return Array.from(new Set(list.filter(Boolean)));
};

const formatProduct = (p) => {
  const productId = p._id?.toString ? p._id.toString() : String(p._id);
  const sections = inferSections(p);
  const section = sections[0] || normalizeSection(p.category || p.section || "discover");

  return {
    id: productId,
    _id: productId,
    title: p.title || p.name || "",
    img: p.img || p.image || "",
    price: p.price || 0,
    category: p.category || "",
    description: p.description || "",
    rating: p.rating || 0,
    brand: p.brand || "",
    stock: p.stock || 0,
    trending: p.trending || false,
    section,
    sections,
    Men: p.Men || false,
    Women: p.Women || false,
    Wedding: p.Wedding || false,
    Signature: p.Signature || false,
    Discover: p.Discover || false,
    Western: p.Western || false,
    Indian: p.Indian || false,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

export const getAllProducts = async (req, res) => {
  try {
    const { western, indian, men, women, wedding, signature, discover, section } = req.query;

    const filter = {};

    if (western === "true") filter.Western = true;
    if (indian === "true") filter.Indian = true;
    if (men === "true") filter.Men = true;
    if (women === "true") filter.Women = true;
    if (wedding === "true") filter.Wedding = true;
    if (signature === "true") filter.Signature = true;
    if (discover === "true") filter.Discover = true;

    const normalizedSection = section ? normalizeSection(section) : null;
    if (normalizedSection) {
      const sectionMatch = { $or: [{ section: normalizedSection }, { sections: normalizedSection }, { Wedding: normalizedSection === "wedding" }, { Signature: normalizedSection === "signature" }, { Discover: normalizedSection === "discover" }, { kurti: normalizedSection === "kurti" }] };
      Object.assign(filter, sectionMatch);
    }

    const products = await Product.find(filter).lean();
    return res.json(products.map((p) => formatProduct(p)));
  } catch (err) {
    console.error("❌ Error in getAllProducts:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ trending: true }).lean();
    return res.json(products.map((p) => formatProduct(p)));
  } catch (err) {
    console.error("❌ Error in getTrendingProducts:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(formatProduct(product));
  } catch (err) {
    console.error("❌ Error in getProductById:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
