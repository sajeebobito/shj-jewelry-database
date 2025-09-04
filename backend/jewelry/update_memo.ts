import { api, APIError } from "encore.dev/api";
import { jewelryDB } from "./db";

export interface UpdateMemoRequest {
  id: number;
  date?: Date;
  clientName?: string;
  itemName?: string;
  itemCount?: number;
  itemPrice?: number;
  totalPrice?: number;
  paid?: number;
  due?: number;
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

// Updates an existing memo.
export const updateMemo = api<UpdateMemoRequest, Memo>(
  { expose: true, method: "PUT", path: "/memos/:id" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      params.push(req.date.toISOString().split('T')[0]);
    }
    if (req.clientName !== undefined) {
      updates.push(`client_name = $${paramIndex++}`);
      params.push(req.clientName);
    }
    if (req.itemName !== undefined) {
      updates.push(`item_name = $${paramIndex++}`);
      params.push(req.itemName);
    }
    if (req.itemCount !== undefined) {
      updates.push(`item_count = $${paramIndex++}`);
      params.push(req.itemCount);
    }
    if (req.itemPrice !== undefined) {
      updates.push(`item_price = $${paramIndex++}`);
      params.push(req.itemPrice);
    }
    if (req.totalPrice !== undefined) {
      updates.push(`total_price = $${paramIndex++}`);
      params.push(req.totalPrice);
    }
    if (req.paid !== undefined) {
      updates.push(`paid = $${paramIndex++}`);
      params.push(req.paid);
    }
    if (req.due !== undefined) {
      updates.push(`due = $${paramIndex++}`);
      params.push(req.due);
    }
    if (req.memoImageUrl !== undefined) {
      updates.push(`memo_image_url = $${paramIndex++}`);
      params.push(req.memoImageUrl);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    params.push(req.id);
    const query = `
      UPDATE memos
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const row = await jewelryDB.rawQueryRow<{
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
    }>(query, ...params);

    if (!row) {
      throw APIError.notFound("Memo not found");
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
