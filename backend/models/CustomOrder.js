import mongoose from "mongoose";

const MeasurementSchema = new mongoose.Schema(
  {
    chest: { type: Number },
    waist: { type: Number },
    hip: { type: Number },
    shoulder: { type: Number },
    sleeveLength: { type: Number },
    armhole: { type: Number },
    shirtLength: { type: Number },
    trouserLength: { type: Number },
  },
  { _id: false }
);

const CustomOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, sparse: true },
    customerId: { type: String, sparse: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderType: { type: String, enum: ["Single Order", "Wedding Order"], required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },

    outfitType: { type: String, required: true },
    color: { type: String, required: true },
    budget: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    designImages: [{ type: String }],

    measurements: { type: MeasurementSchema },

    fabricPreference: { type: String },
    embroideryDetails: { type: String },
    specialInstructions: { type: String },

    weddingPieces: { type: Number },
    weddingNotes: { type: String },

    status: { type: String, default: "Pending" },
    cancelledReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

const CustomOrder = mongoose.model("CustomOrder", CustomOrderSchema);

export default CustomOrder;
