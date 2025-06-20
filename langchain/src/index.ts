//With geminai
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import dotenv from "dotenv";
import { error } from "console";
dotenv.config();
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.7,
});
const messages = [
  [
    new SystemMessage(
      "Translate the following from English into English (correct grammar):"
    ),
    new HumanMessage("ha g kia hall he malik wasim shb"),
  ],
  [
    new SystemMessage("Translate this casual Urdu into professional English:"),
    new HumanMessage("main roz subah 10 baje uthta hon"),
  ],
];
const main = async () => {
  // const response = await model.invoke(messages);
  // console.log("Response:", response.content); // will return object response
  //response2
  // const response2 = await model.batch(messages);
  // console.log("Batch Response:");
  // response2.forEach((res, i) => {
  //   console.log(`\n🔹 Response ${i + 1}:`, res.content);
  // });
  //response3
  // const stream = await model.stream(messages);
  // const chunks = [];
  // for await (const chunk of stream) {
  //   chunks.push(chunk);
  //   console.log(`${chunk.content}|`);
  // }
};
main().catch((error) => {
  console.error("Error in main function:", error);
});

const run = async () => {
  const systemTemplate = "Translate the following from English into {language}";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  const promptValue = await promptTemplate.invoke({
    language: "urdu",
    text: "Hello everyone my name is waseem akram and i'm full-stack developer",
  });
  promptValue.toChatMessages();
  const response = await model.invoke(promptValue);
  console.log(`${response.content}`);
};

run();

//ہیلو سب لوگ، میرا نام وسیم اکرم ہے اور میں ایک فل سٹیک ڈویلپر ہوں۔

//in OPENAI..

// import { ChatOpenAI } from "@langchain/openai";
// import { ChatPromptTemplate } from "@langchain/core/prompts";

// import dotenv from "dotenv";
// dotenv.config();

// const model = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0.7,
//   maxTokens: 500,
// });

// const main = async () => {
//   const response = await model.invoke("what is the capital of France?");
//   console.log("Response:", response); //it will give me object. 22 token used

//   const response2 = await model.batch([
//     "what is the capital of France?",
//     "",
//     "what is the capital of Germany?",
//   ]);
//   console.log("Batch Response:", response2); //it will give me array of objects. 44 token used

//   const response3 = await model.stream("what is the capital of France?");
//   for await (const chunk of response3) {
//     console.log("Streamed Chunk:", chunk);
//   }
// };

// main().catch((error) => {
//   console.error("Error in main function:", error);
// });

// const run = async () => {
//   const systemTemplate = "Translate the following from English into {language}";
//   const promptTemplate = ChatPromptTemplate.fromMessages([
//     ["system", systemTemplate],
//     ["user", "{text}"],
//   ]);

//   const promptValue = await promptTemplate.invoke({
//     language: "urdu",
//     text: "Hello everyone my name is waseem akram and i'm full-stack developer",
//   });
//   promptValue.toChatMessages();
//   const response = await model.invoke(promptValue);
//   console.log(`${response.content}`);
// };

// run();
