import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Printer, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EditMemoModal } from './EditMemoModal';
import backend from '~backend/client';
import type { Memo } from '~backend/jewelry/list_memos';

export function MemoSheets() {
  const { toast } = useToast();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [copies, setCopies] = useState<{ [key: number]: number }>({});

  const loadMemos = async () => {
    try {
      setLoading(true);
      const response = await backend.jewelry.listMemos({
        search: searchTerm || undefined,
        sortBy: 'date',
        limit: 100,
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-['Arial','Roboto',sans-serif]">
          Memo Sheets
        </CardTitle>
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
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMemo(memo)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(memo.id)}
                          className="h-6 w-6 p-0"
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
