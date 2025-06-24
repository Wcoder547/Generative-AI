import dotenv from "dotenv";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

dotenv.config();

async function main() {
  const filePath = "./src/data/docs.txt";
  const rawText = await fs.readFile(filePath, "utf-8");
  if (!rawText.trim()) throw new Error("The document is empty.");
  console.log("📄 Document loaded successfully.");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
  });

  const splitDocs = await splitter.splitDocuments([
    new Document({ pageContent: rawText }),
  ]);
  console.log(`✂️ Document split into ${splitDocs.length} chunks.`);

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "embedding-001",
    })
  );
  console.log("📦 Vector store created with embedded documents.");

  const retriever = vectorStore.asRetriever();
  const question = "What is the content of the document?";
  const relevantDocs = await retriever.getRelevantDocuments(question);

  if (!relevantDocs.length) {
    console.warn("⚠️ No relevant context found.");
    return;
  }

  const context = relevantDocs
    .map((doc, i) => `Context ${i + 1}:\n${doc.pageContent}`)
    .join("\n\n");

  console.log("📚 Context compiled for the prompt.");

  const prompt = `
You are a helpful assistant. Use the following context to answer the user's question.

${context}

Question: ${question}
Answer:`.trim();
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-pro",
    apiVersion: "v1",
    temperature: 0.2,
    maxOutputTokens: 500,
  });

  const response = await model.invoke(prompt);
  console.log("🤖 Answer from Gemini:\n", response.content);
}

main().catch((err) => {
  console.error("❌ An error occurred:", err.message);
  process.exit(1);
});

//with OPENAI
// import dotenv from "dotenv";
// import fs from "fs/promises";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { Document } from "@langchain/core/documents";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";

// import { OpenAIEmbeddings } from "@langchain/openai";
// import { ChatOpenAI } from "@langchain/openai";

// dotenv.config();

// async function main() {
//   // Step 1: Load and read the document
//   const filePath = "./src/data/docs.txt";
//   const rawText = await fs.readFile(filePath, "utf-8");
//   if (!rawText.trim()) throw new Error("The document is empty.");
//   console.log("📄 Document loaded successfully.");

//   // Step 2: Split the document into chunks
//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 100,
//     chunkOverlap: 20,
//   });

//   const splitDocs = await textSplitter.splitDocuments([
//     new Document({ pageContent: rawText }),
//   ]);
//   console.log(`✂️ Document split into ${splitDocs.length} chunks.`);

//   // Step 3: Create a memory vector store from document chunks
//   const vectorStore = await FaissStore.fromDocuments(
//     splitDocs,
//     new OpenAIEmbeddings()
//   );

//   console.log("📦 Vector store created with embedded documents.");

//   // Step 4: Retrieve relevant chunks using a retriever
//   const retriever = vectorStore.asRetriever();
//   const question = "What is the content of the document?";
//   const relevantDocs = await retriever.getRelevantDocuments(question);

//   if (!relevantDocs.length) {
//     console.warn("⚠️ No relevant context found.");
//     return;
//   }

//   const context = relevantDocs
//     .map((doc, i) => `Context ${i + 1}:\n${doc.pageContent}`)
//     .join("\n\n");

//   console.log("📚 Context compiled for the prompt.");

//   // Step 5: Build the prompt
//   const prompt = `
// You are a helpful assistant. Use the following context to answer the user's question.

// ${context}

// Question: ${question}
// Answer:`.trim();

//   // Step 6: Call the language model
//   const model = new ChatOpenAI({
//     modelName: "gpt-4o-mini",
//     maxTokens: 500,
//     temperature: 0.2,
//   });

//   const response = await model.invoke(prompt);
//   console.log("🤖 Answer from model:\n", response.content);
// }

// main().catch((err) => {
//   console.error("❌ An error occurred:", err.message);
//   process.exit(1);
// });
