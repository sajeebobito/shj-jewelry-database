import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

export function MemoPrint() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    itemName: '',
    itemCount: '',
    itemPrice: '',
    paid: '',
    copies: 1,
  });

  const totalPrice = formData.itemCount * formData.itemPrice;
  const due = totalPrice - formData.paid;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAndPrint = async () => {
    try {
      if (!formData.clientName || !formData.itemName) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const memo = await backend.jewelry.createMemo({
        date: new Date(formData.date),
        clientName: formData.clientName,
        itemName: formData.itemName,
        itemCount: formData.itemCount,
        itemPrice: formData.itemPrice,
        totalPrice,
        paid: formData.paid,
        due,
      });

      // Generate print content
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

      // Print multiple copies
      for (let i = 0; i < formData.copies; i++) {
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

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        itemName: '',
        itemCount: '',
        itemPrice: '',
        paid: '',
        copies: 1,
      });

      toast({
        title: "Success",
        description: `Memo saved and printed ${formData.copies} copies`,
      });
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        title: "Error",
        description: "Failed to save memo",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-['Arial','Roboto',sans-serif]">
          Memo Print
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Enter client name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              value={formData.itemName}
              onChange={(e) => handleInputChange('itemName', e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          <div>
            <Label htmlFor="itemCount">Item Count</Label>
            <Input
              id="itemCount"
              type="number"
              min="1"
              value={formData.itemCount}
              onChange={(e) => handleInputChange('itemCount', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="itemPrice">Item Price (৳)</Label>
            <Input
              id="itemPrice"
              type="number"
              min="0"
              value={formData.itemPrice}
              onChange={(e) => handleInputChange('itemPrice', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="totalPrice">Total Price (৳)</Label>
            <Input
              id="totalPrice"
              value={totalPrice}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="paid">Paid (৳)</Label>
            <Input
              id="paid"
              type="number"
              min="0"
              value={formData.paid}
              onChange={(e) => handleInputChange('paid', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="due">Due (৳)</Label>
            <Input
              id="due"
              value={due}
              readOnly
              className="bg-muted"
            />
          </div>
          <div>
            <Label htmlFor="copies">Copies</Label>
            <Input
              id="copies"
              type="number"
              min="1"
              value={formData.copies}
              onChange={(e) => handleInputChange('copies', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveAndPrint}
          className="w-full"
          size="sm"
        >
          Save & Print
        </Button>
      </CardContent>
    </Card>
  );
}
