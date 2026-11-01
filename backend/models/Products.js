import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // UUID compatibility
  title: { type: String, required: true },
  description: { type: String, default: "" },
  brand: { type: String, default: "" },
  category: { type: String, required: true },
  img: { type: String, default: "" },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },

  // New normalized section taxonomy used by the storefront
  section: {
    type: String,
    enum: ["kurti", "wedding", "signature", "discover"],
    default: "discover",
  },
  sections: {
    type: [String],
    default: [],
  },

  // Legacy boolean flags retained for older frontend code and imports
  Men: { type: Boolean, default: false },
  Women: { type: Boolean, default: false },
  Wedding: { type: Boolean, default: false },
  Signature: { type: Boolean, default: false },
  Discover: { type: Boolean, default: false },
  Western: { type: Boolean, default: false },
  Indian: { type: Boolean, default: false },
  kurti: { type: Boolean, default: false },
  weddingSection: { type: Boolean, default: false },
  signatureSection: { type: Boolean, default: false },
  discoverSection: { type: Boolean, default: false },
}, { timestamps: true }); // createdAt & updatedAt

export default mongoose.model("Product", productSchema, "Products");
