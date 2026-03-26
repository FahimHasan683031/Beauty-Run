export interface IVendorStats {
  totalRevenue: number;
  totalProducts: number;
  totalCompletedOrders: number;
  monthlyRevenue: { month: string; revenue: number }[]; // Array of objects
}

export interface IAdminStats {
  totalProducts: number;
  totalUsers: number;
  totalCompletedOrders: number;
  totalRevenue: number;
  totalCommission: number;
  monthlyRevenue: { month: string; revenue: number }[];
  monthlyProviderCount: { month: string; count: number }[];
}
