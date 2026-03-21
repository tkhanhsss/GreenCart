import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  "Order Placed": "#3b82f6",
  Packing: "#eab308",
  Shipped: "#8b5cf6",
  "Out for Delivery": "#f97316",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

const fmtNum = (n) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 20 }).format(n);

const fmt = (n, currency) => `${currency}${fmtNum(n)}`;

const fmtShort = (n) => {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return parseFloat(n.toFixed(1)).toString();
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

/* ─── Mini SVG dual-line chart ─────────────────────────────── */
function DualLineChart({ revenue, profit, currency }) {
  const W = 480, H = 140, PAD = { t: 16, r: 16, b: 32, l: 52 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const n = revenue.length;
  if (n < 2) return null;

  const allVals = [...revenue.map((d) => d.revenue), ...profit.map((d) => d.profit)];
  const minV = Math.min(0, ...allVals);
  const maxV = Math.max(1, ...allVals);
  const range = maxV - minV || 1;

  const xOf = (i) => PAD.l + (i / (n - 1)) * cW;
  const yOf = (v) => PAD.t + cH - ((v - minV) / range) * cH;
  const polyline = (pts) => pts.map(([x, y]) => `${x},${y}`).join(" ");

  const revPoints = revenue.map((d, i) => [xOf(i), yOf(d.revenue)]);
  const proPoints = profit.map((d, i) => [xOf(i), yOf(d.profit)]);
  const revFill = [[xOf(0), yOf(0)], ...revPoints, [xOf(n - 1), yOf(0)]];
  const ticks = 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = minV + (range / ticks) * i;
        const y = yOf(v);
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
              {fmtShort(v)}
            </text>
          </g>
        );
      })}
      <polygon points={revFill.map(([x, y]) => `${x},${y}`).join(" ")} fill="url(#revGrad)" />
      <polyline points={polyline(revPoints)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={polyline(proPoints)} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" strokeLinejoin="round" />
      {revenue.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
          {fmtDate(d.date)}
        </text>
      ))}
      {minV < 0 && (
        <line x1={PAD.l} y1={yOf(0)} x2={W - PAD.r} y2={yOf(0)} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
      )}
    </svg>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon, accent = "primary" }) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-500",
    orange: "bg-orange-100 text-orange-500",
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accents[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Profit Metric ─────────────────────────────────────────── */
function ProfitMetric({ label, value, note, color = "text-gray-800" }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-base font-bold truncate ${color}`}>{value}</p>
      {note && <p className="text-xs text-gray-400">{note}</p>}
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────── */
function Dashboard() {
  const { axios, currency } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/order/dashboard");
        if (data.success) setStats(data.stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!stats) return <div className="p-10 text-gray-400">Failed to load dashboard.</div>;

  const isProfit = stats.grossProfit >= 0;
  const totalStatusOrders = Object.values(stats.statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="no-scrollbar flex-1 h-full overflow-y-auto">
      <div className="w-full p-6 md:p-10 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Store overview & performance</p>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard accent="blue" label="Total Revenue" value={fmt(stats.totalRevenue, currency)}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <KpiCard accent="primary" label="Total Orders" value={stats.totalOrders}
            sub={`${stats.statusBreakdown["Delivered"] || 0} delivered`}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          />
          <KpiCard accent="purple" label="Products" value={stats.totalProducts}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>}
          />
          <KpiCard accent="primary" label="Customers" value={stats.totalUsers}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
        </div>

        {/* ── Profit Summary ─────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Header bar */}
          <div className={`px-6 py-3 flex items-center gap-2 ${isProfit ? "bg-green-50 border-b border-green-100" : "bg-red-50 border-b border-red-100"}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isProfit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isProfit ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
            </div>
            <h2 className={`text-sm font-semibold ${isProfit ? "text-green-700" : "text-red-600"}`}>
              Profit Summary
            </h2>
            <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${isProfit ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
              {isProfit ? "Profitable" : "Loss"}
            </span>
          </div>

          {/* Metrics grid */}
          <div className="px-6 py-5 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-x-4 gap-y-4">

            {/* Revenue */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400 mb-1">Revenue</p>
              <p className="text-lg font-bold text-blue-600 truncate">{fmt(stats.totalRevenue, currency)}</p>
            </div>

            {/* Minus */}
            <div className="text-gray-300 text-xl font-light select-none">−</div>

            {/* Import Cost */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400 mb-1">Import Cost</p>
              <p className="text-lg font-bold text-orange-500 truncate">{fmt(stats.totalImportCost, currency)}</p>
            </div>

            {/* Minus */}
            <div className="text-gray-300 text-xl font-light select-none">−</div>

            {/* Cancellation Loss */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400 mb-1">Cancellation Loss</p>
              <p className="text-lg font-bold text-red-500 truncate">{fmt(stats.cancellationLoss, currency)}</p>
            </div>

            {/* Equals */}
            <div className="text-gray-300 text-xl font-light select-none">=</div>

            {/* Gross Profit */}
            <div className={`rounded-xl px-4 py-3 min-w-0 ${isProfit ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
              <p className="text-xs font-medium text-gray-400 mb-1">Gross Profit</p>
              <p className={`text-xl font-extrabold truncate ${isProfit ? "text-green-600" : "text-red-500"}`}>
                {isProfit ? "+" : ""}{fmt(stats.grossProfit, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Charts Row ─────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Revenue & Profit chart */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Revenue & Profit — Last 7 Days</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-green-500 inline-block rounded" style={{ borderTop: "2px dashed #22c55e", background: "none" }} />
                  Profit
                </span>
              </div>
            </div>
            <DualLineChart revenue={stats.revenueByDay} profit={stats.profitByDay} currency={currency} />
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Status Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(STATUS_COLORS).map(([status, color]) => {
                const count = stats.statusBreakdown[status] || 0;
                const pct = Math.round((count / totalStatusOrders) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{status}</span>
                      <span className="text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom Row ─────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Low Stock Alerts */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Low Stock Alerts</h2>
              <Link to="/seller/stock-import" className="text-xs text-primary font-semibold hover:underline">
                Import Stock →
              </Link>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">All products are well stocked 🎉</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.lowStockProducts.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img src={p.images?.[0]} alt={p.name} className="max-w-full max-h-full object-contain p-1" />
                    </div>
                    <p className="flex-1 text-sm font-medium text-gray-700 truncate">{p.name}</p>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                      p.quantity === 0
                        ? "bg-red-50 text-red-500 border-red-100"
                        : "bg-orange-50 text-orange-600 border-orange-100"
                    }`}>
                      {p.quantity === 0 ? "Out of stock" : `${p.quantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
              <Link to="/seller/orders" className="text-xs text-primary font-semibold hover:underline">
                View all →
              </Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">No orders yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.recentOrders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between px-5 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-gray-700">
                        #{o._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {o.itemCount} item{o.itemCount !== 1 ? "s" : ""} · {new Date(o.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-800">{fmt(o.amount, currency)}</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap"
                        style={{
                          backgroundColor: STATUS_COLORS[o.status] + "18",
                          color: STATUS_COLORS[o.status],
                          borderColor: STATUS_COLORS[o.status] + "40",
                        }}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
