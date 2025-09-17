// lib/utils.js
export function calculateTripFinancials({ total_sale = 0, fuel_cost = 0, other_expenses = 0 }) {
  const net = Number(total_sale) - Number(fuel_cost) - Number(other_expenses);
  const commissionRate = Number(process.env.DRIVER_COMMISSION_RATE ?? 0.1);
  const driverCommission = Math.max(0, net * commissionRate);
  const companyProfit = Math.max(0, net - driverCommission);
  return {
    net,
    driverCommission,
    companyProfit,
  };
}

// Add this for shadcn/ui table
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
