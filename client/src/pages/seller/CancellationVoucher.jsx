import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const REASONS = ["Damaged", "Lost", "Expired", "Other"];
const emptyRow = () => ({ productId: "", quantity: 1, reason: "Damaged" });

function CancellationVoucher() {
  const { products, currency, axios } = useAppContext();
  const [rows, setRows] = useState([emptyRow()]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchVouchers = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await axios.get("/api/cancellation/vouchers");
      if (data.success) setVouchers(data.vouchers);
    } catch (err) {
      console.error(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const updateRow = (idx, field, value) =>
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const row of rows) {
      if (!row.productId) return toast.error("Please select a product for each row");
      if (row.quantity < 1) return toast.error("Quantity must be at least 1");
    }

    setLoading(true);
    try {
      const items = rows.map((r) => ({
        product: r.productId,
        quantity: parseInt(r.quantity),
        reason: r.reason,
      }));
      const { data } = await axios.post("/api/cancellation/voucher", { items, note });
      if (data.success) {
        toast.success(`Voucher ${data.voucher.voucherCode} created!`);
        setRows([emptyRow()]);
        setNote("");
        fetchVouchers();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const reasonColor = {
    Damaged: "bg-orange-50 text-orange-600 border-orange-100",
    Lost: "bg-red-50 text-red-600 border-red-100",
    Expired: "bg-yellow-50 text-yellow-600 border-yellow-100",
    Other: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="no-scrollbar flex-1 h-full overflow-y-auto">
      <div className="w-full p-6 md:p-10 max-w-5xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Cancellation Voucher</h1>
            <p className="text-xs text-gray-400 mt-0.5">Write off damaged, lost or expired stock</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">New Cancellation Voucher</h2>

          {/* Rows */}
          <div className="space-y-3 mb-4">
            {rows.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-center flex-wrap">
                {/* Product select */}
                <select
                  value={row.productId}
                  onChange={(e) => updateRow(idx, "productId", e.target.value)}
                  className="flex-1 min-w-40 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-gray-50 focus:bg-white transition-all"
                  required
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>

                {/* Quantity */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-gray-400 whitespace-nowrap">Qty</label>
                  <input
                    type="number" min="1"
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none text-center focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-gray-50 focus:bg-white transition-all"
                    required
                  />
                </div>

                {/* Reason */}
                <select
                  value={row.reason}
                  onChange={(e) => updateRow(idx, "reason", e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-gray-50 focus:bg-white transition-all"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {/* Remove row */}
                {rows.length > 1 && (
                  <button type="button" onClick={() => removeRow(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add row */}
          <button type="button" onClick={addRow}
            className="flex items-center gap-2 text-xs text-red-500 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another product
          </button>

          {/* Note */}
          <div className="mb-5">
            <label className="block text-xs text-gray-500 font-medium mb-1.5">Notes (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. Flood damage in warehouse B, discovered on 2026-03-20"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
            {loading ? "Creating…" : "Create Voucher"}
          </button>
        </form>

        {/* History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Cancellation History</h2>
          </div>

          {historyLoading ? (
            <div className="py-10 text-center text-gray-300 text-sm">Loading…</div>
          ) : vouchers.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No cancellations yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {vouchers.map((v) => (
                <div key={v._id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-red-500">{v.voucherCode}</span>
                    <span className="text-xs text-gray-400">{formatDate(v.createdAt)}</span>
                  </div>
                  <div className="space-y-1">
                    {v.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="font-medium text-gray-800">{item.product?.name ?? "—"}</span>
                        <span className="text-gray-400">×{item.quantity}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${reasonColor[item.reason] || reasonColor.Other}`}>
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                  {v.note && (
                    <p className="text-xs text-gray-400 italic mt-2 truncate max-w-xs">{v.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CancellationVoucher;
