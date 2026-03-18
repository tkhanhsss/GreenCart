import Product from "../models/Product.js";
import Order from "../models/Order.js";

const calculateOrderAmount = async (items) => {
  const subtotal = await items.reduce(async (accP, item) => {
    const acc = await accP;
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product not found");
    if (product.quantity < item.quantity)
      throw new Error(`Not enough stock for "${product.name}"`);
    return acc + product.offerPrice * item.quantity;
  }, Promise.resolve(0));
  return subtotal + Math.floor(subtotal * 0.02); // +2% tax
};

const VALID_STATUSES = [
  "Order Placed",
  "Packing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// POST /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, address, items } = req.body;

    if (!address || items.length === 0)
      return res.json({ success: false, message: "Invalid data" });

    const amount = await calculateOrderAmount(items);

    await Order.create({ userId, items, amount, address, paymentType: "COD", isPaid: false });

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
    }

    return res.json({ success: true, message: "Order placed successfully!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/order/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!VALID_STATUSES.includes(status))
      return res.json({ success: false, message: "Invalid status" });

    const order = await Order.findById(orderId);
    if (!order)
      return res.json({ success: false, message: "Order not found" });

    const wasCancelled = order.status === "Cancelled";
    const isCancelling = status === "Cancelled";

    // Restore stock when cancelling
    if (isCancelling && !wasCancelled) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
      }
    }

    // Deduct stock when restoring from cancelled
    if (wasCancelled && !isCancelling) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product || product.quantity < item.quantity)
          return res.json({ success: false, message: "Not enough stock to restore order" });
        await Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } });
      }
    }

    order.status = status;
    await order.save();

    return res.json({ success: true, message: "Order status updated", status });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
