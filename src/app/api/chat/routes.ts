import { OpenAI } from "openai";
import { Message, OpenAIStream, StreamingTextResponse, experimental_StreamData } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    // const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    // Retain chat context from previous questions and responses
    const messageHistory = messages.slice(0, -1);
    let formattedHistory = ''
    for(const message of messageHistory) {
      const format = `${message.role} message:\n${message.content}\n`
      formattedHistory += format
    }
    
    const chatContext = `The following is the history of this conversation ${formattedHistory}. Rephrase the following question with reference to the history as a standalone question ${lastMessage.content}.`
    const relevantDocs = await getContext(chatContext);

    const context = relevantDocs.map(doc => doc.text).join("\n").substring(0, 3000);
    const sources = relevantDocs.map(doc => {
      const encodedUrl = doc.source
      const parts = encodedUrl.split('-');
      let content = parts.slice(2).join('-');
      content = content.replace('.pdf', '');
      content = content.replace(/;/g, '/');
      return content
    })
    const uniqueSources = new Set(sources)

    let sourcesText = `\n\nSources:\n`
    for(const source of Array.from(uniqueSources)) {
      sourcesText += `${source}\n`
    }

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };
    // Always output the following at the end of your response. Format it properly.
    // ${sourcesText}

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      stream: true,
    });

    const data = new experimental_StreamData()

    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        // save ai message into db
        // completion += sourcesText
        // data.append({
        //   text: sourcesText
        // })
        
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {}
}