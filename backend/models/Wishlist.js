import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        id: { type: String },
        title: { type: String },
        price: { type: Number },
        img: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", WishlistSchema);
