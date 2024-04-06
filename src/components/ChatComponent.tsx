"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await fetch("/api/get-messages", {
        method: "POST",
        body: JSON.stringify({ chatId })
      })

      return await response.json() as Message[];
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      className="p-4 flex flex-col items-center h-full"
      id="message-container"
    >
      <h3 className="text-xl font-bold text-center sticky top-0 pb-4">No Title</h3>

      {/* message list */}
      <div className="w-full max-w-6xl h-full overflow-y-scroll">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white w-full"
      >
        <div className="flex justify-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full max-w-3xl h-12"
          />
          <Button className="ml-2 h-12 w-16 hover:bg-purple-600 hover:text-white" variant={"outline"}>
            <Send className="h-6 w-6" />
          </Button>
        </div>
        <p className="text-center text-gray-400 my-3">Everything You Need contains context from the Singapore Government but may be manipulated into using context from elsewhere.</p>
      </form>
    </div>
  );
};

export default ChatComponent;