import { api, APIError } from "encore.dev/api";
import { jewelryDB } from "./db";

export interface DeleteMemoRequest {
  id: number;
}

// Deletes a memo.
export const deleteMemo = api<DeleteMemoRequest, void>(
  { expose: true, method: "DELETE", path: "/memos/:id" },
  async (req) => {
    const result = await jewelryDB.exec`
      DELETE FROM memos WHERE id = ${req.id}
    `;
    
    // Note: In a real implementation, you'd check if any rows were affected
    // PostgreSQL doesn't return affected rows count directly through this interface
  }
);
