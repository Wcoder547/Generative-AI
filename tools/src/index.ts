// Import OpenAI SDK and dotenv for environment variable support
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Our custom function (tool) to get the current time in New York
function getTimeInNewYork(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
}

// ✅ Main function to demonstrate OpenAI tool calling
async function callOpenAiTool() {
  // Initial chat context (conversation history)
  const context: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello! How can you assist me today?" },
    {
      role: "assistant",
      content:
        "I can help you with a variety of tasks, such as answering questions, providing information, and assisting with problem-solving.",
    },
  ];

  // Step 1: Make initial API call, including a tool definition
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: context,
    tools: [
      {
        type: "function", // Tells GPT this is a function-type tool
        function: {
          name: "getTimeInNewYork", // Must match our function name
          description: "Get the current time in New York", // GPT uses this to decide when to call the tool
        },
      },
    ],
    tool_choice: "auto", // Let GPT decide if it wants to call the tool
  });

  // Check if GPT chose to call a tool
  const willInvokeTool = response.choices[0].finish_reason === "tool_calls";
  const toolCall = response.choices[0].message.tool_calls?.[0];

  if (willInvokeTool && toolCall?.function.name === "getTimeInNewYork") {
    // Step 2: Call our local function (simulate actual tool execution)
    const timeInNewYork = getTimeInNewYork();

    // Step 3: Add tool's result as part of chat history
    context.push({
      role: "tool",
      tool_call_id: toolCall.id ?? "", // Link response to tool call
      content: timeInNewYork,
    });

    // Step 4: Re-send updated conversation to GPT to get its final response
    const finalResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: context,
    });

    // Print GPT’s final answer using the tool's result
    console.log("Assistant:", finalResponse.choices[0].message.content);
  } else {
    console.log("Tool was not invoked.");
  }
}

// ✅ Call the main function
callOpenAiTool().catch((err) => {
  console.error("Error:", err);
});
