import { loadDocumentIntoPinecone } from "@/lib/pinecone";
import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.formData();
    const file = body.get('file') as File;

    const storage = new Storage();

    const buffer = await file.arrayBuffer();
    const fileKey =
      "uploads-" + Date.now().toString() + "-" + file.name.replace(" ", "-");

    await storage
      .bucket("every-document")
      .file(fileKey)
      .save(Buffer.from(buffer));

    await loadDocumentIntoPinecone(fileKey);

    return NextResponse.json(
      {
        file_key: fileKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is missing" },
        { status: 400 }
      );
    }

    const storage = new Storage();
    const url = storage.bucket("every-document").file(fileKey).publicUrl();

    return NextResponse.json({ url: url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
