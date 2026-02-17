import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const MODEL_NAME = 'veo-3.1-fast-generate-preview';

/**
 * Generates a video using the Veo model.
 * Note: Uses polling to wait for the operation to complete.
 */
export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<string> => {
  try {
    // 1. Initialize API Client
    // We create a new instance each time to ensure we pick up the latest selected key from process.env.API_KEY
    if (!process.env.API_KEY) {
      throw new Error("API Key not found. Please select a paid API key.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    onProgress("Initializing generation request...");

    // 2. Start Generation
    let operation = await ai.models.generateVideos({
      model: MODEL_NAME,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio,
      }
    });

    onProgress("Dreaming up the scene... (This may take a minute)");

    // 3. Poll for completion
    const startTime = Date.now();
    
    while (!operation.done) {
      // Polling delay
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Update progress message based on elapsed time to keep user engaged
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed > 10 && elapsed < 30) {
        onProgress(`Rendering frames... (${elapsed}s)`);
      } else if (elapsed >= 30 && elapsed < 60) {
        onProgress(`Polishing pixels... (${elapsed}s)`);
      } else if (elapsed >= 60) {
        onProgress(`Finalizing video... (${elapsed}s)`);
      }

      // Check status
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    // 4. Retrieve Result
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      throw new Error("Video generation completed but no URI was returned.");
    }

    onProgress("Downloading video...");

    // 5. Download the actual video bytes
    // The URI requires the API key appended for access
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Video Generation Error:", error);
    // Handle the specific "Requested entity was not found" error for key issues
    if (error.message && error.message.includes("Requested entity was not found")) {
      throw new Error("API Key invalid or project not found. Please re-select your API key.");
    }
    throw error;
  }
};