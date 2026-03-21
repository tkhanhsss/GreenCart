import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    images: { type: Array, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ quantity: 1 });
productSchema.index({ category: 1 });

const Product =
  mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
