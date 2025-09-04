import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Memo } from '~backend/jewelry/list_memos';

export function ThisWeekEntry() {
  const { toast } = useToast();
  const [timespan, setTimespan] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on timespan
      const now = new Date();
      let startDate: Date;
      
      switch (timespan) {
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

      // Get sales stats and memos
      const [statsResponse, memosResponse] = await Promise.all([
        backend.jewelry.getSalesStats({ 
          period: timespan,
          startDate: startDate.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        }),
        backend.jewelry.listMemos({ 
          sortBy: 'date',
          limit: 50
        })
      ]);

      // Filter memos by date range
      const filteredMemos = memosResponse.memos.filter(memo => {
        const memoDate = new Date(memo.date);
        return memoDate >= startDate && memoDate <= now;
      });

      setMemos(filteredMemos);
      setTotalRevenue(statsResponse.cashAvailable);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timespan]);

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  const getTimespanLabel = () => {
    switch (timespan) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Week';
    }
  };

  const periodTotal = memos.reduce((sum, memo) => sum + memo.totalPrice, 0);
  const paidTotal = memos.reduce((sum, memo) => sum + memo.paid, 0);
  const dueTotal = memos.reduce((sum, memo) => sum + memo.due, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold font-['Arial','Roboto',sans-serif]">
          {getTimespanLabel()} Sales
        </h2>
        <Select value={timespan} onValueChange={(value: any) => setTimespan(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{getTimespanLabel()} Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(periodTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(paidTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(dueTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Cash Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{getTimespanLabel()} Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs">Item</TableHead>
                    <TableHead className="text-xs">Count</TableHead>
                    <TableHead className="text-xs">Price</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Paid</TableHead>
                    <TableHead className="text-xs">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memos.map((memo) => (
                    <TableRow key={memo.id}>
                      <TableCell className="text-xs">
                        {new Date(memo.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs">{memo.clientName}</TableCell>
                      <TableCell className="text-xs">{memo.itemName}</TableCell>
                      <TableCell className="text-xs">{memo.itemCount}</TableCell>
                      <TableCell className="text-xs">৳{memo.itemPrice}</TableCell>
                      <TableCell className="text-xs">৳{memo.totalPrice}</TableCell>
                      <TableCell className="text-xs">৳{memo.paid}</TableCell>
                      <TableCell className="text-xs">৳{memo.due}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
