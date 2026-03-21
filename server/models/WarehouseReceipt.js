import mongoose from "mongoose";

const receiptItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const warehouseReceiptSchema = new mongoose.Schema(
  {
    receiptCode: { type: String, required: true, unique: true },
    items: { type: [receiptItemSchema], required: true },
    totalCost: { type: Number, required: true, default: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

warehouseReceiptSchema.index({ createdAt: -1 });

const WarehouseReceipt =
  mongoose.models.WarehouseReceipt ||
  mongoose.model("WarehouseReceipt", warehouseReceiptSchema);

export default WarehouseReceipt;
