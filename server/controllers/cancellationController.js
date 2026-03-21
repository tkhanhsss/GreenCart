import Product from "../models/Product.js";
import CancellationVoucher from "../models/CancellationVoucher.js";

// Generate voucher code: CV-YYYYMMDD-XXX
const generateVoucherCode = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `CV-${dateStr}-`;
  const count = await CancellationVoucher.countDocuments({
    voucherCode: { $regex: `^${prefix}` },
  });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
};

// POST /api/cancellation/voucher
export const createVoucher = async (req, res) => {
  try {
    const { items, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.json({ success: false, message: "Items are required" });

    // Validate stock for each item
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1)
        return res.json({ success: false, message: "Invalid item data" });

      const product = await Product.findById(item.product);
      if (!product)
        return res.json({ success: false, message: "Product not found" });

      if (item.quantity > product.quantity)
        return res.json({
          success: false,
          message: `"${product.name}" only has ${product.quantity} in stock. Cannot cancel ${item.quantity}.`,
        });
    }

    const voucherCode = await generateVoucherCode();

    const voucher = await CancellationVoucher.create({
      voucherCode,
      items,
      note: note || "",
      status: "approved",
    });

    // Deduct product quantities in a single bulkWrite
    await Product.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity } },
        },
      }))
    );

    res.json({ success: true, message: "Cancellation voucher created", voucher });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/cancellation/vouchers
export const listVouchers = async (req, res) => {
  try {
    const vouchers = await CancellationVoucher.find({})
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, vouchers });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
