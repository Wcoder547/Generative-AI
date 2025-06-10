// Import required libraries
import OpenAI from "openai"; // OpenAI SDK for API interaction
import dotenv from "dotenv"; // For loading environment variables
import { join } from "path"; // To handle file paths
import { readFileSync, writeFileSync } from "fs"; // For file operations

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client using API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Ensure this key exists in .env
});

// Define the Fruits type
type Fruits = {
  id: string;
  name: string;
  description: string;
  embedding?: number[]; // Optional until generated
};

// Calculate dot product of two vectors
const dotProduct = (vecA: number[], vecB: number[]): number => {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dot = dotProduct(vecA, vecB);
  const magA = Math.sqrt(dotProduct(vecA, vecA)); // Magnitude of A
  const magB = Math.sqrt(dotProduct(vecB, vecB)); // Magnitude of B
  return dot / (magA * magB);
};

// Find similarity scores between target fruit and other fruits
const similaritySearch = (fruits: Fruits[], target: Fruits) => {
  return fruits
    .filter((fruit) => fruit.id !== target.id) // Exclude the target fruit itself
    .map((fruit) => ({
      name: fruit.name,
      dot: dotProduct(fruit.embedding!, target.embedding!),
      cosine: cosineSimilarity(fruit.embedding!, target.embedding!),
    }))
    .sort((a, b) => b.cosine - a.cosine); // Sort descending by similarity
};

// Load JSON file and parse its content
export function loadFruitsJsonFile<T>(fileName: string): T {
  const filePath = join(__dirname, fileName);
  const rawData = readFileSync(filePath, "utf-8");
  return JSON.parse(rawData);
}

// Generate embeddings for each fruit description using OpenAI
async function generateEmbeddings(fruitDescriptions: string[]) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small", // Specify the embedding model
    input: fruitDescriptions, // Send array of descriptions
  });
  return response;
}

// Save JSON data to a file
const saveDataToJsonFile = (fileName: string, data: any) => {
  const filePath = join(__dirname, fileName);
  const jsonData = JSON.stringify(data, null, 2); // Pretty format
  writeFileSync(filePath, jsonData, "utf-8");
};

// Main function to execute the process
async function run() {
  // Load fruits from JSON file
  const fruits: Fruits[] = loadFruitsJsonFile("fruits.json");

  // Extract fruit descriptions
  const fruitDescriptions = fruits.map((fruit) => fruit.description);

  // Get embeddings for all fruit descriptions
  const embeddings = await generateEmbeddings(fruitDescriptions);

  // Attach embeddings back to fruit objects
  const fruitsWithEmbeddings: Fruits[] = fruits.map((fruit, index) => ({
    ...fruit,
    embedding: embeddings.data[index].embedding,
  }));

  // Save fruits with embeddings to a new file
  saveDataToJsonFile("fruits_with_embeddings.json", fruitsWithEmbeddings);

  // Choose a target fruit (e.g., first one)
  const targetFruit = fruitsWithEmbeddings[0];

  // Find similar fruits based on cosine similarity
  const similarities = similaritySearch(fruitsWithEmbeddings, targetFruit);

  // Display results
  console.log(`Similar fruits to ${targetFruit.name}:`);
  similarities.forEach((similarity) => {
    console.log(
      `Name: ${similarity.name}, Dot Product: ${similarity.dot.toFixed(
        2
      )}, Cosine Sim: ${similarity.cosine.toFixed(2)}`
    );
  });

  // Indicate end of process
  console.log("Done");
}

// Execute the program
run();
