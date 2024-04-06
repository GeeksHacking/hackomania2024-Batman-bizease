"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation'

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  const [title, setTitle] = React.useState('No title')
  const router = useRouter()

  return (
    <div className="w-full overflow-y-scroll p-4 text-black">
      <Button className="w-full border-dashed border-black border" variant={"outline"} onClick={
        async () => {
          const response = await fetch('/api/create-chat', {method: "POST"})
          const result = await response.json()
          router.push(`/chat/${result.chat_id}`)
        }
      }>
        <PlusCircle className="mr-2 w-4 h-4" />
        New Chat
      </Button>

      <div className="flex h-full pb-20 flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-gray-200 text-gray-900": chat.id === chatId,
                "bg-white hover:bg-gray-200 text-gray-900": chat.id !== chatId,
              })}
            >
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                No Title
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;