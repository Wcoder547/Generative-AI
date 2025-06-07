const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const openai = new OpenAI();

type contextType = {
  role: string;
  content: string;
}[];
const context: contextType = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  {
    role: "user",
    content: "Hello! How can you assist me today?",
  },
  {
    role: "assistant",
    content:
      "I can help you with a variety of tasks, such as answering questions, providing information, and assisting with problem-solving.",
  },
];
async function chatCompletion() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
  });

  const responseMessage = response.choices[0].message.content;
  context.push({
    role: "assistant",
    content: responseMessage.content,
  });
  console.log(
    "Assistant:",
    response.choices[0].message.role,
    response.choices[0].message.content
  );
}

async function run() {
  const input = require("prompt-sync")({ signint: true });

  while (true) {
    const userInput = input() as string;
    if (userInput.toLowerCase() === "exit") {
      console.log("Exiting the chat application.");
      break;
    }
    context.push({
      role: "user",
      content: userInput,
    });
    await chatCompletion();
  }
}
run().catch((error: any) => {
  console.error("Error during OpenAI API call:", error);
});
