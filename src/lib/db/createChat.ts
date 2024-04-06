import { db } from "@/lib/db";
import { chats } from "./schema";

export async function createChat(userId: string) {
  try {
    const chatId = await db
      .insert(chats)
      .values({
        userId,
      })
      .returning({
        insertedId: chats.id,
      });
    return chatId[0].insertedId
  } catch (error) {
    console.error(error)
  }
}