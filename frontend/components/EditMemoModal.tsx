import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { Memo } from '~backend/jewelry/list_memos';

interface EditMemoModalProps {
  memo: Memo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (memo: Memo) => void;
}

export function EditMemoModal({ memo, open, onOpenChange, onUpdate }: EditMemoModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date(memo.date).toISOString().split('T')[0],
    clientName: memo.clientName,
    itemName: memo.itemName,
    itemCount: memo.itemCount,
    itemPrice: memo.itemPrice,
    paid: memo.paid,
  });

  const totalPrice = formData.itemCount * formData.itemPrice;
  const due = totalPrice - formData.paid;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedMemo = await backend.jewelry.updateMemo({
        id: memo.id,
        date: new Date(formData.date),
        clientName: formData.clientName,
        itemName: formData.itemName,
        itemCount: formData.itemCount,
        itemPrice: formData.itemPrice,
        totalPrice,
        paid: formData.paid,
        due,
      });

      onUpdate(updatedMemo);
      toast({
        title: "Success",
        description: "Memo updated successfully",
      });
    } catch (error) {
      console.error('Error updating memo:', error);
      toast({
        title: "Error",
        description: "Failed to update memo",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Memo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-clientName">Client Name</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-itemName">Item Name</Label>
              <Input
                id="edit-itemName"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-itemCount">Item Count</Label>
              <Input
                id="edit-itemCount"
                type="number"
                min="1"
                value={formData.itemCount}
                onChange={(e) => handleInputChange('itemCount', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-itemPrice">Item Price (৳)</Label>
              <Input
                id="edit-itemPrice"
                type="number"
                min="0"
                value={formData.itemPrice}
                onChange={(e) => handleInputChange('itemPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="edit-totalPrice">Total Price (৳)</Label>
              <Input
                id="edit-totalPrice"
                value={totalPrice}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-paid">Paid (৳)</Label>
              <Input
                id="edit-paid"
                type="number"
                min="0"
                value={formData.paid}
                onChange={(e) => handleInputChange('paid', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="edit-due">Due (৳)</Label>
              <Input
                id="edit-due"
                value={due}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
