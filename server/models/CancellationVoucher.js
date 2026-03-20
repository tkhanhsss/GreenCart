import mongoose from "mongoose";

const voucherItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: {
      type: String,
      enum: ["Damaged", "Lost", "Expired", "Other"],
      required: true,
    },
  },
  { _id: false }
);

const cancellationVoucherSchema = new mongoose.Schema(
  {
    voucherCode: { type: String, required: true, unique: true },
    items: { type: [voucherItemSchema], required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "approved",
    },
  },
  { timestamps: true }
);

const CancellationVoucher =
  mongoose.models.CancellationVoucher ||
  mongoose.model("CancellationVoucher", cancellationVoucherSchema);

export default CancellationVoucher;
