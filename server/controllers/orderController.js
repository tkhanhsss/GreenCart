import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import WarehouseReceipt from "../models/WarehouseReceipt.js";
import CancellationVoucher from "../models/CancellationVoucher.js";

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

// GET /api/order/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const [orders, products, users, receipts, vouchers] = await Promise.all([
      Order.find({}).populate("items.product", "offerPrice"),
      Product.find({}),
      User.find({ isDeleted: { $ne: true } }),
      WarehouseReceipt.find({}),
      CancellationVoucher.find({}).populate("items.product", "name images"),
    ]);

    // ─── KPI basics ───────────────────────────────────────────────────
    const nonCancelledOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = nonCancelledOrders.reduce((s, o) => s + o.amount, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;
    const lowStockCount = products.filter((p) => p.quantity <= 5).length;
    const cancelledVouchers = vouchers.length;

    // ─── Profit calculation ───────────────────────────────────────────
    // Build avg unit cost per product from WarehouseReceipts
    const importMap = {}; // productId → { totalCost, totalQty }
    for (const receipt of receipts) {
      for (const item of receipt.items) {
        const pid = item.product.toString();
        if (!importMap[pid]) importMap[pid] = { totalCost: 0, totalQty: 0 };
        importMap[pid].totalCost += item.unitCost * item.quantity;
        importMap[pid].totalQty += item.quantity;
      }
    }
    const avgUnitCost = (pid) => {
      const m = importMap[pid];
      return m && m.totalQty > 0 ? m.totalCost / m.totalQty : 0;
    };

    const totalImportCost = receipts.reduce((s, r) => s + r.totalCost, 0);

    const cancellationLoss = vouchers.reduce((sum, v) => {
      return (
        sum +
        v.items.reduce((s, item) => {
          const pid = item.product?._id?.toString() ?? item.product?.toString();
          return s + item.quantity * avgUnitCost(pid);
        }, 0)
      );
    }, 0);

    const grossProfit = totalRevenue - totalImportCost - cancellationLoss;

    // ─── Order status breakdown ────────────────────────────────────────
    const statusBreakdown = {};
    for (const o of orders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    }

    // ─── Last 7 days: revenue & profit per day ─────────────────────────
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const revenueByDay = {};
    const importCostByDay = {};
    const lossByDay = {};
    days.forEach((d) => {
      revenueByDay[d] = 0;
      importCostByDay[d] = 0;
      lossByDay[d] = 0;
    });

    for (const o of nonCancelledOrders) {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      if (revenueByDay[d] !== undefined) revenueByDay[d] += o.amount;
    }
    for (const r of receipts) {
      const d = new Date(r.createdAt).toISOString().slice(0, 10);
      if (importCostByDay[d] !== undefined) importCostByDay[d] += r.totalCost;
    }
    for (const v of vouchers) {
      const d = new Date(v.createdAt).toISOString().slice(0, 10);
      if (lossByDay[d] !== undefined) {
        lossByDay[d] += v.items.reduce((s, item) => {
          const pid = item.product?._id?.toString() ?? item.product?.toString();
          return s + item.quantity * avgUnitCost(pid);
        }, 0);
      }
    }

    const revenueByDayArr = days.map((date) => ({ date, revenue: revenueByDay[date] }));
    const profitByDayArr = days.map((date) => ({
      date,
      profit: revenueByDay[date] - importCostByDay[date] - lossByDay[date],
    }));

    // ─── Low stock products (qty <= 5) ────────────────────────────────
    const lowStockProducts = products
      .filter((p) => p.quantity <= 5)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 8)
      .map((p) => ({ _id: p._id, name: p.name, images: p.images, quantity: p.quantity }));

    // ─── Recent orders (last 5) ───────────────────────────────────────
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((o) => ({
        _id: o._id,
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt,
        itemCount: o.items.length,
        paymentType: o.paymentType,
        isPaid: o.isPaid,
      }));

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockCount,
        cancelledVouchers,
        totalImportCost,
        cancellationLoss,
        grossProfit,
        statusBreakdown,
        revenueByDay: revenueByDayArr,
        profitByDay: profitByDayArr,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
