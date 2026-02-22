export interface NetWorthDataPoint {
  date: string;
  total: number;
}

export interface AccountTypeBreakdown {
  type: string;
  total: number | null;
}
