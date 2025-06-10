// ✅ Import OpenAI SDK and dotenv to manage environment variables
import { OpenAI } from "openai";
import dotenv from "dotenv";

// ✅ Load variables from .env (e.g., OPENAI_API_KEY)
dotenv.config();

// ✅ Initialize OpenAI with the API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Main async function to interact with OpenAI
async function run() {
  // Step 1: Make a chat completion request
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Choose the model
    messages: [
      { role: "developer", content: "Talk like a pirate." }, // Non-standard role (ignored by OpenAI)
      { role: "user", content: "Are semicolons optional in JavaScript?" }, // User question
    ],
  });

  // Step 2: Output the assistant's response
  console.log("Assistant:", response.choices[0].message.content);
}

// ✅ Run the main function, and log any errors
run().catch((error) => {
  console.error("Error occurred:", error);
});
