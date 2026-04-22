import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Scene {
  veoPrompt: string;
  script: string;
}

export interface GenerationResult {
  hook: string;
  hashtags: string[];
  scenes: Scene[];
}

export async function generateContent(
  imageContent: string | null, // base64
  description: string,
  sceneCount: number,
  category: string
): Promise<GenerationResult> {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    You are a professional 3D character artist and scriptwriter for short-form video content (TikTok/Reels).
    Your task is to transform a product into a personified 3D character.
    
    1. CHARACTER CONSISTENCY (CRITICAL):
       - Start by defining a "Reference Character Design" based on the product.
       - Use a highly specific list of unique traits (e.g., "bright sapphire blue eyes", "a slightly tilted stem on the left", "matte fuzzy texture").
       - THIS EXACT character description MUST be included in EVERY scene prompt to ensure the AI generator (Veo 3) maintains consistency.
    
    2. SCENE DESIGN (Veo 3 Prompt):
       - Use a "Consistent Character Description" as the foundation for every prompt. This description must include the exact same physical traits in every single scene.
       - The character must remain identical; only change the environment, pose, and expression.
       - Describe the scene using cinematic terms.
       - IMPORTANT: STRICTLY NO TEXT OR WRITING in the generated image.
    
    3. SCRIPT (Tiếng Việt):
       - Write a short dialogue (approx. 8 seconds when spoken) in Vietnamese related to the product benefit.
       - Use an engaging, conversational, and natural Vietnamese tone (văn phong tự nhiên, gần gũi).
    
    4. HOOK & HASHTAGS (Tiếng Việt):
       - Create 1 viral hook title and 5 hashtags in Vietnamese.

    OUTPUT FORMAT: JSON specified in schema.
  `;

  const prompt = `
    Product: ${description}
    Category: ${category}
    Number of Scenes: ${sceneCount}
    
    Please analyze the product (from image and text) and generate ${sceneCount} distinct scenes.
    Each scene should show the character in a different pose or expressing a different benefit.
  `;

  const contents: any[] = [];
  
  if (imageContent) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageContent.split(",")[1],
      },
    });
  }
  
  contents.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            hashtags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  veoPrompt: { type: Type.STRING },
                  script: { type: Type.STRING }
                },
                required: ["veoPrompt", "script"]
              }
            }
          },
          required: ["hook", "hashtags", "scenes"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as GenerationResult;
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
}
