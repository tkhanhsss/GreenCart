import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import WarehouseReceipt from "../models/WarehouseReceipt.js";
import CancellationVoucher from "../models/CancellationVoucher.js";

// Batch fetch products and validate stock, return total amount
const calculateOrderAmount = async (items) => {
  const ids = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  for (const item of items) {
    const product = productMap.get(item.product.toString());
    if (!product) throw new Error("Product not found");
    if (product.quantity < item.quantity)
      throw new Error(`Not enough stock for "${product.name}"`);
    subtotal += product.offerPrice * item.quantity;
  }
  return parseFloat((subtotal * 1.02).toPrecision(12)); // +2% tax
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

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
    });

    // Deduct stock in one bulkWrite
    await Product.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity } },
        },
      })),
    );

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
    if (!order) return res.json({ success: false, message: "Order not found" });

    const wasCancelled = order.status === "Cancelled";
    const isCancelling = status === "Cancelled";

    // Restore stock when cancelling — single bulkWrite
    if (isCancelling && !wasCancelled) {
      await Product.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: item.quantity } },
          },
        })),
      );
    }

    // Deduct stock when restoring from cancelled
    if (wasCancelled && !isCancelling) {
      const ids = order.items.map((i) => i.product);
      const products = await Product.find({ _id: { $in: ids } });
      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      for (const item of order.items) {
        const product = productMap.get(item.product.toString());
        if (!product || product.quantity < item.quantity)
          return res.json({
            success: false,
            message: "Not enough stock to restore order",
          });
      }

      await Product.bulkWrite(
        order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: -item.quantity } },
          },
        })),
      );
    }

    order.status = status;
    if (status === "Delivered") order.isPaid = true;
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
      .populate({ path: "items.product", populate: { path: "category" } })
      .populate("address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/order/seller  — paginated
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({})
        .populate({ path: "items.product", populate: { path: "category" } })
        .populate("address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({}),
    ]);

    res.json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/order/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // ─── Run aggregations in parallel ────────────────────────────────
    const [
      orderKpis,
      recentOrders,
      revenueByDayAgg,
      lowStockProducts,
      totalUsers,
      receipts,
      vouchers,
    ] = await Promise.all([
      // KPI: revenue, order count, status breakdown
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $ne: ["$status", "Cancelled"] }, "$amount", 0],
              },
            },
          },
        },
      ]),

      // Recent 5 orders
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("amount status createdAt items paymentType isPaid"),

      // Last 7 days revenue by day
      Order.aggregate([
        {
          $match: {
            status: { $ne: "Cancelled" },
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
          },
        },
      ]),

      // Low-stock products
      Product.find({ quantity: { $lte: 5 } })
        .sort({ quantity: 1 })
        .limit(8)
        .select("name images quantity"),

      // Active user count
      User.countDocuments({ isDeleted: { $ne: true } }),

      // All receipts for import cost / profit calc (keep small in early stage)
      WarehouseReceipt.find({}).select("items totalCost createdAt"),

      // All vouchers for cancellation loss calc
      CancellationVoucher.find({})
        .populate("items.product", "name images")
        .select("items createdAt"),
    ]);

    // ─── KPI aggregation results ──────────────────────────────────────
    let totalRevenue = 0;
    let totalOrders = 0;
    const statusBreakdown = {};

    for (const row of orderKpis) {
      totalRevenue += row.revenue;
      totalOrders += row.count;
      statusBreakdown[row._id] = row.count;
    }

    // ─── Profit calculation ───────────────────────────────────────────
    const importMap = {};
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

    // ─── Last 7 days chart ────────────────────────────────────────────
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const revenueMap = Object.fromEntries(
      revenueByDayAgg.map((r) => [r._id, r.revenue]),
    );

    const importCostByDay = {};
    const lossByDay = {};
    days.forEach((d) => {
      importCostByDay[d] = 0;
      lossByDay[d] = 0;
    });

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

    const revenueByDayArr = days.map((date) => ({
      date,
      revenue: revenueMap[date] || 0,
    }));
    const profitByDayArr = days.map((date) => ({
      date,
      profit: (revenueMap[date] || 0) - importCostByDay[date] - lossByDay[date],
    }));

    // ─── Product counts ───────────────────────────────────────────────
    const [totalProducts, lowStockCount] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ quantity: { $lte: 5 } }),
    ]);

    const cancelledVouchers = vouchers.length;

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
