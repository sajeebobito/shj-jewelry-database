import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Wallet, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Memo } from '~backend/jewelry/list_memos';

interface SalesMetrics {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  yearSales: number;
  todayPaid: number;
  weekPaid: number;
  monthPaid: number;
  yearPaid: number;
}

export function SalesTab() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SalesMetrics>({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    yearSales: 0,
    todayPaid: 0,
    weekPaid: 0,
    monthPaid: 0,
    yearPaid: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadSalesMetrics = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      
      // Today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // This week (last 7 days)
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      // This month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // This year
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const [todayStats, weekStats, monthStats, yearStats] = await Promise.all([
        backend.jewelry.getSalesStats({
          period: 'day',
          startDate: todayStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }),
        backend.jewelry.getSalesStats({
          period: 'week',
          startDate: weekStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }),
        backend.jewelry.getSalesStats({
          period: 'month',
          startDate: monthStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }),
        backend.jewelry.getSalesStats({
          period: 'year',
          startDate: yearStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        })
      ]);

      // Calculate totals from period sales
      const todayTotal = todayStats.periodSales.reduce((sum, day) => sum + day.sales, 0);
      const todayPaidTotal = todayStats.periodSales.reduce((sum, day) => sum + day.paid, 0);
      
      const weekTotal = weekStats.periodSales.reduce((sum, day) => sum + day.sales, 0);
      const weekPaidTotal = weekStats.periodSales.reduce((sum, day) => sum + day.paid, 0);
      
      const monthTotal = monthStats.periodSales.reduce((sum, day) => sum + day.sales, 0);
      const monthPaidTotal = monthStats.periodSales.reduce((sum, day) => sum + day.paid, 0);
      
      const yearTotal = yearStats.periodSales.reduce((sum, day) => sum + day.sales, 0);
      const yearPaidTotal = yearStats.periodSales.reduce((sum, day) => sum + day.paid, 0);

      setMetrics({
        todaySales: todayTotal,
        weekSales: weekTotal,
        monthSales: monthTotal,
        yearSales: yearTotal,
        todayPaid: todayPaidTotal,
        weekPaid: weekPaidTotal,
        monthPaid: monthPaidTotal,
        yearPaid: yearPaidTotal,
      });
    } catch (error) {
      console.error('Error loading sales metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesMetrics();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadSalesMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const MetricCard = ({ 
    title, 
    value, 
    paidValue, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    paidValue: number;
    icon: React.ElementType; 
    color: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              formatCurrency(value)
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Cash: {loading ? (
              <span className="inline-block h-4 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <span className="text-green-600 font-medium">
                {formatCurrency(paidValue)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-['Arial','Roboto',sans-serif]">
          Sales Dashboard
        </h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Auto-refreshes every minute
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today Sales"
          value={metrics.todaySales}
          paidValue={metrics.todayPaid}
          icon={Calendar}
          color="text-blue-600"
        />
        
        <MetricCard
          title="This Week Sales"
          value={metrics.weekSales}
          paidValue={metrics.weekPaid}
          icon={TrendingUp}
          color="text-green-600"
        />
        
        <MetricCard
          title="This Month Sales"
          value={metrics.monthSales}
          paidValue={metrics.monthPaid}
          icon={Wallet}
          color="text-purple-600"
        />
        
        <MetricCard
          title="This Year Sales"
          value={metrics.yearSales}
          paidValue={metrics.yearPaid}
          icon={TrendingUp}
          color="text-orange-600"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(metrics.yearSales)}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on current year data
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cash Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(metrics.yearPaid)}
            </div>
            <div className="text-sm text-muted-foreground">
              Total payments received
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Outstanding Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(metrics.yearSales - metrics.yearPaid)}
            </div>
            <div className="text-sm text-muted-foreground">
              Pending collections
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
