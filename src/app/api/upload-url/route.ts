import { loadDocumentIntoPinecone } from "@/lib/pinecone";
import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";
import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { jsPDF } from "jspdf";

export type HtmlPage = {
  pageContent: string;
  metadata: {
    source: string;
    title: string;
    language: string;
  };
};

export async function POST(req: Request, res: Response) {
  try {
    const { url } = await req.json();

    const compiledConvert = compile({
      wordwrap: 130,
      longWordSplit: {
        forceWrapOnLimit: true,
      },
    });
    const loader = new RecursiveUrlLoader(url, {
      extractor: compiledConvert,
      maxDepth: 0,
    });

    const docs = (await loader.load()) as HtmlPage[];

    let pdfDoc = new jsPDF();
    pdfDoc.setFontSize(10);

    docs.map((doc, i) => {
      var splitTitle = pdfDoc.splitTextToSize(doc.pageContent, 200);
      var y = 10;
      for (var i = 0; i < splitTitle.length; i++) {
        if (y > 280) {
          y = 0;
          pdfDoc.addPage();
        }
        pdfDoc.text(splitTitle[i], 0, y);
        y = y + 5;
      }
    })

    const blob = pdfDoc.output('blob');
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Buffer made");

    const storage = new Storage();

    const fileKey =
      "uploads-" + Date.now().toString() + "-" + url.toString().replace(/\//g, ';') + '.pdf';

    await storage
      .bucket("every-document")
      .file(fileKey)
      .save(Buffer.from(buffer));

    console.log("Stored into cloud")

    await loadDocumentIntoPinecone(fileKey);
    console.log("loaded into pinecone")

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