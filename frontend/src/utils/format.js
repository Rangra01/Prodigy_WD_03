export const formatINR = (amount) => {
  const value = Number(amount);
  if (Number.isNaN(value)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const statusLabel = (status) => {
  const labels = {
    Pending: 'Pending',
    Confirmed: 'Confirmed',
    Shipped: 'Shipped',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
  };
  return labels[status] || status;
};
