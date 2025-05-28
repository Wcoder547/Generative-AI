import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// const openai = new OpenAI();

async function run() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "developer", content: "Talk like a pirate." },
      { role: "user", content: "Are semicolons optional in JavaScript?" },
    ],
  });
  console.log(response.choices[0].message.content);
}

run().catch(console.error);
