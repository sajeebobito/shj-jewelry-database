import { api } from "encore.dev/api";
import { jewelryDB } from "./db";

export interface CreateMemoRequest {
  date: Date;
  clientName: string;
  itemName: string;
  itemCount: number;
  itemPrice: number;
  totalPrice: number;
  paid: number;
  due: number;
  memoImageUrl?: string;
}

export interface Memo {
  id: number;
  date: Date;
  clientName: string;
  itemName: string;
  itemCount: number;
  itemPrice: number;
  totalPrice: number;
  paid: number;
  due: number;
  memoImageUrl?: string;
  createdAt: Date;
}

// Creates a new memo entry.
export const createMemo = api<CreateMemoRequest, Memo>(
  { expose: true, method: "POST", path: "/memos" },
  async (req) => {
    const row = await jewelryDB.queryRow<{
      id: number;
      date: string;
      client_name: string;
      item_name: string;
      item_count: number;
      item_price: number;
      total_price: number;
      paid: number;
      due: number;
      memo_image_url: string | null;
      created_at: string;
    }>`
      INSERT INTO memos (date, client_name, item_name, item_count, item_price, total_price, paid, due, memo_image_url)
      VALUES (${req.date.toISOString().split('T')[0]}, ${req.clientName}, ${req.itemName}, ${req.itemCount}, ${req.itemPrice}, ${req.totalPrice}, ${req.paid}, ${req.due}, ${req.memoImageUrl})
      RETURNING *
    `;

    if (!row) {
      throw new Error("Failed to create memo");
    }

    return {
      id: row.id,
      date: new Date(row.date),
      clientName: row.client_name,
      itemName: row.item_name,
      itemCount: row.item_count,
      itemPrice: row.item_price,
      totalPrice: row.total_price,
      paid: row.paid,
      due: row.due,
      memoImageUrl: row.memo_image_url || undefined,
      createdAt: new Date(row.created_at),
    };
  }
);
