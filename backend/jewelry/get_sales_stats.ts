import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { jewelryDB } from "./db";

export interface SalesStatsRequest {
  period?: Query<string>; // 'day', 'week', 'month', 'year'
  startDate?: Query<string>;
  endDate?: Query<string>;
}

export interface SalesStats {
  totalSales: number;
  cashAvailable: number;
  totalDue: number;
  periodSales: Array<{
    period: string;
    sales: number;
    paid: number;
    due: number;
  }>;
}

// Retrieves sales statistics for specified period.
export const getSalesStats = api<SalesStatsRequest, SalesStats>(
  { expose: true, method: "GET", path: "/sales/stats" },
  async (req) => {
    const period = req.period || 'week';
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (req.startDate && req.endDate) {
      startDate = new Date(req.startDate);
      endDate = new Date(req.endDate);
    } else {
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
      }
    }

    const [totalStats, periodStats] = await Promise.all([
      jewelryDB.queryRow<{
        total_sales: number;
        total_paid: number;
        total_due: number;
      }>`
        SELECT 
          COALESCE(SUM(total_price), 0) as total_sales,
          COALESCE(SUM(paid), 0) as total_paid,
          COALESCE(SUM(due), 0) as total_due
        FROM memos
      `,
      jewelryDB.queryAll<{
        period: string;
        sales: number;
        paid: number;
        due: number;
      }>`
        SELECT 
          date::text as period,
          COALESCE(SUM(total_price), 0) as sales,
          COALESCE(SUM(paid), 0) as paid,
          COALESCE(SUM(due), 0) as due
        FROM memos
        WHERE date >= ${startDate.toISOString().split('T')[0]} 
          AND date <= ${endDate.toISOString().split('T')[0]}
        GROUP BY date
        ORDER BY date DESC
      `
    ]);

    return {
      totalSales: totalStats?.total_sales || 0,
      cashAvailable: totalStats?.total_paid || 0,
      totalDue: totalStats?.total_due || 0,
      periodSales: periodStats || [],
    };
  }
);
