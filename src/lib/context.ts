import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "./embedding";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
) {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
    const pineconeIndex = pc.index("everything-you-need");
    // const namespace = pineconeIndex.namespace("uploads-1712387836674-MROct23_SF_C.pdf");
    const queryResult = await pineconeIndex.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
    source: string;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata));
  return docs
}