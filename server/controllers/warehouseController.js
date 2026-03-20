import Product from "../models/Product.js";
import WarehouseReceipt from "../models/WarehouseReceipt.js";

// Generate receipt code: IR-YYYYMMDD-XXX
const generateReceiptCode = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `IR-${dateStr}-`;
  const count = await WarehouseReceipt.countDocuments({
    receiptCode: { $regex: `^${prefix}` },
  });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
};

// POST /api/warehouse/receipt
export const createReceipt = async (req, res) => {
  try {
    const { items, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.json({ success: false, message: "Items are required" });

    // Validate each item
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1)
        return res.json({ success: false, message: "Invalid item data" });
      if (item.unitCost == null || item.unitCost < 0)
        return res.json({ success: false, message: "Invalid unit cost" });
    }

    // Calculate total cost
    const totalCost = items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    );

    const receiptCode = await generateReceiptCode();

    // Create receipt
    const receipt = await WarehouseReceipt.create({
      receiptCode,
      items,
      totalCost,
      note: note || "",
    });

    // Increment product quantities
    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
          inStock: true,
        })
      )
    );

    res.json({ success: true, message: "Receipt created", receipt });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/warehouse/receipts
export const listReceipts = async (req, res) => {
  try {
    const receipts = await WarehouseReceipt.find({})
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, receipts });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
