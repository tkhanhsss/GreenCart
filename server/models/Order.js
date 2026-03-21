import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "product",
        },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "address" },
    status: {
      type: String,
      enum: ["Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Order Placed",
    },
    paymentType: { type: String, enum: ["COD"], required: true },
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
