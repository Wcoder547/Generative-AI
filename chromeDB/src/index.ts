// ===== Imports =====
import { ChromaClient, EmbeddingFunction } from "chromadb";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config(); // Load .env variables (like OPENAI_API_KEY)

// ===== Initialize OpenAI client =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set your OpenAI key in .env
});

// ===== Initialize ChromaDB client =====
const chromaClient = new ChromaClient({
  host: "localhost", // ChromaDB server address
  port: 8000, // Default port
});

// Check if ChromaDB is running
chromaClient.heartbeat();

// ===== Custom embedding function using OpenAI =====
class OpenAIEmbedding implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Efficient, smaller embedding model
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }
}

// ===== Initialize ChromaDB collection with embedding function =====
const getCollection = async () => {
  const embedder = new OpenAIEmbedding();

  const collection = await chromaClient.createCollection({
    name: "my_collection",
    embeddingFunction: embedder,
  });

  return collection;
};

// ===== Add text documents to ChromaDB collection =====
const addMessage = async (id: string, text: string) => {
  const collection = await getCollection();

  await collection.add({
    ids: [id],
    documents: [text],
  });

  console.log(` Added: "${text}" (ID: ${id})`);
};
// ===== Search for semantically similar messages =====
const searchSimilarMessages = async (query: string, limit = 3) => {
  const collection = await getCollection();

  const result = await collection.query({
    queryTexts: [query],
    nResults: limit,
  });

  console.log(`Top match for "${query}":`);
  console.log(result.documents[0]); // Top result(s)

  return result.documents[0];
};

// ===== Run app =====
const run = async () => {
  await addMessage("1", "Hello, how can I help you?");
  await addMessage("2", "Sure, I can book your appointments.");
  await addMessage("3", "The weather is sunny and warm today.");

  await searchSimilarMessages("Can you help me book something?");
};

run();
