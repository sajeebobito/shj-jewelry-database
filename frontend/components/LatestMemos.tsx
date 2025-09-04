import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Memo } from '~backend/jewelry/list_memos';

export function LatestMemos() {
  const { toast } = useToast();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLatestMemos = async () => {
    try {
      setLoading(true);
      const response = await backend.jewelry.listMemos({
        limit: 10,
        sortBy: 'created_at',
      });
      setMemos(response.memos);
    } catch (error) {
      console.error('Error loading latest memos:', error);
      toast({
        title: "Error",
        description: "Failed to load latest memos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestMemos();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLatestMemos, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-['Arial','Roboto',sans-serif]">
          Latest Sales/Memos
        </CardTitle>
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
  );
}
