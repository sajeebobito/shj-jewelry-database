import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Printer, Search, Calendar, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EditMemoModal } from './EditMemoModal';
import backend from '~backend/client';
import type { Memo } from '~backend/jewelry/list_memos';

interface GroupedMemos {
  [monthKey: string]: Memo[];
}

export function MemoSheets() {
  const { toast } = useToast();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [copies, setCopies] = useState<{ [key: number]: number }>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadMemos = async () => {
    try {
      setLoading(true);
      const response = await backend.jewelry.listMemos({
        search: searchTerm || undefined,
        sortBy: 'date',
        limit: 200,
      });
      setMemos(response.memos);
    } catch (error) {
      console.error('Error loading memos:', error);
      toast({
        title: "Error",
        description: "Failed to load memos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemos();
  }, [searchTerm]);

  // Filter memos by date range and search term
  const filteredMemos = useMemo(() => {
    let filtered = memos;

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(memo => {
        const memoDate = new Date(memo.date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');
        
        // Set time to start/end of day for proper comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return memoDate >= start && memoDate <= end;
      });
    }

    return filtered;
  }, [memos, startDate, endDate]);

  // Group memos by month with gaps
  const groupedMemos = useMemo(() => {
    const groups: GroupedMemos = {};
    
    filteredMemos.forEach(memo => {
      const date = new Date(memo.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(memo);
    });

    // Sort months in descending order
    const sortedGroups: GroupedMemos = {};
    Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .forEach(key => {
        sortedGroups[key] = groups[key].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

    return sortedGroups;
  }, [filteredMemos]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      try {
        await backend.jewelry.deleteMemo({ id });
        setMemos(prev => prev.filter(memo => memo.id !== id));
        toast({
          title: "Success",
          description: "Memo deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting memo:', error);
        toast({
          title: "Error",
          description: "Failed to delete memo",
          variant: "destructive",
        });
      }
    }
  };

  const handlePrint = (memo: Memo) => {
    const printCopies = copies[memo.id] || 1;
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
        <h2 style="text-align: center; margin-bottom: 20px;">SHJ DATABASE</h2>
        <hr>
        <p><strong>Date:</strong> ${new Date(memo.date).toLocaleDateString()}</p>
        <p><strong>Client:</strong> ${memo.clientName}</p>
        <p><strong>Item:</strong> ${memo.itemName}</p>
        <p><strong>Count:</strong> ${memo.itemCount}</p>
        <p><strong>Price:</strong> ৳${memo.itemPrice}</p>
        <p><strong>Total Price:</strong> ৳${memo.totalPrice}</p>
        <p><strong>Paid:</strong> ৳${memo.paid}</p>
        <p><strong>Due:</strong> ৳${memo.due}</p>
        <hr>
        <p style="text-align: center; margin-top: 20px;">Thank you for your business!</p>
      </div>
    `;

    for (let i = 0; i < printCopies; i++) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Memo - ${memo.clientName}</title></head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }

    toast({
      title: "Success",
      description: `Printed ${printCopies} copies`,
    });
  };

  const handleUpdate = (updatedMemo: Memo) => {
    setMemos(prev => prev.map(memo => 
      memo.id === updatedMemo.id ? updatedMemo : memo
    ));
    setEditingMemo(null);
  };

  const setCopyCount = (memoId: number, count: number) => {
    setCopies(prev => ({ ...prev, [memoId]: count }));
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getMonthTotal = (memos: Memo[]) => {
    return memos.reduce((sum, memo) => sum + memo.totalPrice, 0);
  };

  const getMonthPaid = (memos: Memo[]) => {
    return memos.reduce((sum, memo) => sum + memo.paid, 0);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-['Arial','Roboto',sans-serif]">
          Memo Sheets
        </CardTitle>
        
        {/* Search and Date Filter Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
            />
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearDateFilters}
                className="h-9"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          {/* Filter Summary */}
          {(startDate || endDate || searchTerm) && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredMemos.length} of {memos.length} memos
              {searchTerm && ` matching "${searchTerm}"`}
              {(startDate || endDate) && (
                <span>
                  {' '}from {startDate || 'beginning'} to {endDate || 'now'}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>
        ) : Object.keys(groupedMemos).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No memos found matching your criteria
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMemos).map(([monthKey, monthMemos]) => (
              <div key={monthKey} className="space-y-3">
                {/* Month Header with Summary */}
                <div className="border-b border-border pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {formatMonthHeader(monthKey)}
                    </h3>
                    <div className="text-sm text-muted-foreground space-x-4">
                      <span>Total: ৳{getMonthTotal(monthMemos).toLocaleString()}</span>
                      <span>Paid: ৳{getMonthPaid(monthMemos).toLocaleString()}</span>
                      <span>Entries: {monthMemos.length}</span>
                    </div>
                  </div>
                </div>

                {/* Month Data Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Item Name</TableHead>
                        <TableHead className="text-xs">Count</TableHead>
                        <TableHead className="text-xs">Price</TableHead>
                        <TableHead className="text-xs">Total</TableHead>
                        <TableHead className="text-xs">Paid</TableHead>
                        <TableHead className="text-xs">Due</TableHead>
                        <TableHead className="text-xs">Copies</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthMemos.map((memo) => (
                        <TableRow key={memo.id}>
                          <TableCell className="text-xs">
                            {new Date(memo.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs">{memo.clientName}</TableCell>
                          <TableCell className="text-xs">{memo.itemName}</TableCell>
                          <TableCell className="text-xs">{memo.itemCount}</TableCell>
                          <TableCell className="text-xs">৳{memo.itemPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-xs">৳{memo.totalPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-xs">৳{memo.paid.toLocaleString()}</TableCell>
                          <TableCell className="text-xs">৳{memo.due.toLocaleString()}</TableCell>
                          <TableCell className="text-xs">
                            <Input
                              type="number"
                              min="1"
                              value={copies[memo.id] || 1}
                              onChange={(e) => setCopyCount(memo.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-6 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePrint(memo)}
                                className="h-6 w-6 p-0"
                                title="Print memo"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMemo(memo)}
                                className="h-6 w-6 p-0"
                                title="Edit memo"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(memo.id)}
                                className="h-6 w-6 p-0"
                                title="Delete memo"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {editingMemo && (
        <EditMemoModal
          memo={editingMemo}
          open={true}
          onOpenChange={(open) => !open && setEditingMemo(null)}
          onUpdate={handleUpdate}
        />
      )}
    </Card>
  );
}
