import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2, Upload, User } from "lucide-react";
import React from "react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    messages.length > 0 ? 
      <div className="flex flex-col gap-2 px-4 w-full mt-10 max-h-96">
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={cn("flex", {
                "justify-end": message.role === "user",
                "justify-start w-3/4": message.role === "system" || message.role === "assistant",
              })}
            >
              <div className="flex-col">
                <div
                  className={cn(
                    "rounded-lg px-4 text-sm py-2 shadow-md ring-1 ring-gray-900/10",
                    {
                      "bg-gray-800 text-white": message.role === "user",
                    },
                    {
                      "bg-purple-600 text-white": message.role === "system" || message.role === "assistant",
                    }
                  )}
                >
                  <div><Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown></div>
                </div>
                <div className={cn("flex mt-2", {"justify-end": message.role === "user"})}>
                  <User/>
                  <p className="text-black capitalize">{message.role}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      :
      <div className="flex justify-center items-center flex-col h-full">
        <h2 className="text-2xl font-bold text-center mb-8">What would you like to find out today?</h2>
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <div className="col-span-1 row-span-1">
            <div className="flex rounded-lg border hover:bg-gray-200 p-4 items-center gap-4 cursor-pointer">
              <div className="">
                <h6>How to start a business</h6>
                <p className="text-gray-500">for a home business in Singapore</p>
              </div>
              <Upload/>
            </div>
          </div>
          <div className="col-span-1 row-span-1">
            <div className="flex rounded-lg border hover:bg-gray-200 p-4 items-center gap-4 cursor-pointer">
              <div className="">
                <h6>How to start a business</h6>
                <p className="text-gray-500">for a home business in Singapore</p>
              </div>
              <Upload/>
            </div>
          </div>
          <div className="col-span-1 row-span-1">
            <div className="flex rounded-lg border hover:bg-gray-200 p-4 items-center gap-4 cursor-pointer">
              <div className="">
                <h6>How to start a business</h6>
                <p className="text-gray-500">for a home business in Singapore</p>
              </div>
              <Upload/>
            </div>
          </div>
          <div className="col-span-1 row-span-1">
            <div className="flex rounded-lg border hover:bg-gray-200 p-4 items-center gap-4 cursor-pointer">
              <div className="">
                <h6>How to start a business</h6>
                <p className="text-gray-500">for a home business in Singapore</p>
              </div>
              <Upload/>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MessageList;