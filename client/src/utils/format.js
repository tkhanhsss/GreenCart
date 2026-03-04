const currency = import.meta.env.VITE_CURRENCY;

export const formatCurrency = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
  }).format(price);
};
