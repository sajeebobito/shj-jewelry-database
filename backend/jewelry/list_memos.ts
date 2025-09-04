import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { jewelryDB } from "./db";

export interface ListMemosRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  sortBy?: Query<string>;
  search?: Query<string>;
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

export interface ListMemosResponse {
  memos: Memo[];
  total: number;
}

// Retrieves memos with optional filtering and sorting.
export const listMemos = api<ListMemosRequest, ListMemosResponse>(
  { expose: true, method: "GET", path: "/memos" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    const sortBy = req.sortBy || "created_at";
    const search = req.search || "";

    let query = `
      SELECT id, date, client_name, item_name, item_count, item_price, total_price, paid, due, memo_image_url, created_at
      FROM memos
    `;
    let countQuery = `SELECT COUNT(*) as count FROM memos`;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      const searchCondition = ` WHERE (client_name ILIKE $${paramIndex} OR item_name ILIKE $${paramIndex})`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const orderDirection = sortBy === "date" ? "DESC" : "DESC";
    query += ` ORDER BY ${sortBy === "date" ? "date" : "created_at"} ${orderDirection}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [memoRows, countRow] = await Promise.all([
      jewelryDB.rawQueryAll<{
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
      }>(query, ...params),
      jewelryDB.rawQueryRow<{ count: number }>(countQuery, ...(search ? [params[0]] : []))
    ]);

    const memos: Memo[] = memoRows.map(row => ({
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
    }));

    return {
      memos,
      total: countRow?.count || 0,
    };
  }
);
