import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { downloadDocument } from './cloudStorage';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter"
import { getEmbeddings } from './embedding';
import md5 from "md5";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

type PDFPage = {
  pageContent: string
  metadata: {
    source: string
    loc: {pageNumber: number}
  }
}

export async function loadDocumentIntoPinecone(fileKey: string) {
  console.log('Downloading file from the cloud')
  const fileDestination = await downloadDocument(fileKey);
  if(!fileDestination) {
    throw new Error('File not downloaded')
  }
  const loader = new PDFLoader(fileDestination);
  
  const docs = await loader.load() as PDFPage[];

  console.log('Splitting document')
  const documents = await Promise.all(docs.map(prepareDocument))

  console.log('Embedding documents')
  const vectors = await Promise.all(documents.flat().map(embedDocument))

  console.log('Uploading to pinecone')
  const index = pc.Index("everything-you-need")
  // const namespace = index.namespace(convertToAscii(fileKey));
  await index.upsert(vectors)
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page
  pageContent = pageContent.replace(/\n/g, '')
  const splitter = new RecursiveCharacterTextSplitter()
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
        source: metadata.source,
      }
    })
  ])
  return docs
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
        source: doc.metadata.source,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}