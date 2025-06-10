// Import required libraries
import OpenAI from "openai"; // OpenAI SDK for API calls
import dotenv from "dotenv"; // For loading environment variables from .env file
import { createReadStream, writeFileSync } from "node:fs"; // File system utilities
import { Buffer } from "node:buffer"; // Used to handle binary data like image/audio
import fetch from "node-fetch"; // To download image from a URL (required for DALL·E 3)

// Load environment variables (like OPENAI_API_KEY) from the .env file
dotenv.config();

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set your API key in a .env file
});

// ----------- Function 1: Generate an Image from Text -----------
async function generateImageFromText() {
  // Use the DALL·E 3 model to generate an image based on a text prompt
  const response = await openai.images.generate({
    prompt:
      "A futuristic city skyline at sunset, with flying cars and neon lights", // Image description
    n: 1, // Number of images to generate
    size: "1024x1024", // Image resolution
    model: "dall-e-3", // Use DALL·E 3 for high quality
    style: "natural", // Natural photo-realistic style
    quality: "high", // High quality output
  });

  // Extract the image URL from the response
  const imageUrl = response.data?.[0]?.url;

  if (imageUrl) {
    // Fetch the image from the URL
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    // Save the image as image.png in the current directory
    writeFileSync("image.png", buffer);
    console.log("Image saved as image.png");
  } else {
    console.log("Image URL not found in response.");
  }
}

// ----------- Function 2: Convert Text to Speech (Voice) -----------
async function generateVoiceFromText() {
  const sampleText =
    "Hello, this is a sample text to generate voice from OpenAI's API.";

  // Use the TTS model to convert text to audio
  const response = await openai.audio.speech.create({
    input: sampleText, // Text to convert
    model: "tts-1", // Text-to-speech model
    voice: "alloy", // Choose a voice: alloy, echo, fable, onyx, nova, or shimmer
  });

  // Convert response to buffer and save as MP3
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync("output.mp3", buffer);
  console.log(" Audio saved as output.mp3");
}

// ----------- Function 3: Transcribe Audio to Text -----------
async function speechToText() {
  // Use Whisper model to transcribe audio (you can change the file name if needed)
  const response = await openai.audio.transcriptions.create({
    file: createReadStream("output.mp3"), // Load the audio file created above
    model: "whisper-1", // Whisper model for transcription
    language: "en", // Set language of the audio
    response_format: "text", // Get plain text output
  });

  // Print the transcription result
  console.log("Transcription:");
  console.log(response);
}

// ----------- Main Function to Run All Tasks in Sequence -----------
async function main() {
  try {
    console.log("🔹 Generating image...");
    await generateImageFromText(); // Call image generation

    console.log("🔹 Generating voice...");
    await generateVoiceFromText(); // Call TTS

    console.log("🔹 Transcribing voice to text...");
    await speechToText(); // Call transcription
  } catch (error) {
    if (error instanceof Error) {
      console.error(" An error occurred:", error.message);
    } else {
      console.error(" An error occurred:", error);
    }
  }
}

// Run the main function
main();
