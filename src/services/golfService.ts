import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askGolfCoach(prompt: string) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are an expert PGA Golf Coach. 
  Your goal is to explain golf swing mechanics in a clear, technical, yet accessible way. 
  Focus on:
  - Kinetic chain and sequencing.
  - Body rotation and weight transfer.
  - Club path and face angle.
  - Common faults (slice, hook, fat/thin shots) and their mechanical causes.
  Keep responses concise and structured with markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "죄송합니다. 코칭 정보를 가져오는 중 오류가 발생했습니다.";
  }
}
