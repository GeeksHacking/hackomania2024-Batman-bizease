import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import { db } from "@/lib/db";
import { createChat } from "@/lib/db/createChat";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    console.log("No chats found for current user")
    return redirect("/");
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    const chatId = await createChat(userId);

    if (chatId) {
      return redirect(`/chat/${chatId}`)
    } else {
      return redirect("/");
    }
  }

  return (
    <div className="flex w-full pt-32 h-screen">
      <div className="flex-[1] max-w-xs">
        <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
      </div>
      <div className="flex-[3] border-l-4 border-l-slate-200 h-full">
        <ChatComponent chatId={parseInt(chatId)} />
      </div>
    </div>
  );
};

export default ChatPage;