import { GoogleGenAI } from "@google/genai";

export async function askGolfCoach(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing in environment");
    return "서비스 설정을 확인 중입니다. (API 키 누락)";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Using gemini-3-flash-preview as recommended for basic text tasks
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert PGA Golf Coach. Explain golf swing mechanics clearly and technically. Keep responses concise and use markdown.",
        temperature: 0.7,
      }
    });
    
    if (!response.text) {
      return "코치가 현재 답변을 드릴 수 없는 상태입니다. 잠시 후 다시 시도해주세요.";
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // If gemini-3-flash-preview fails, try gemini-flash-latest as a fallback
    try {
      const aiFallback = new GoogleGenAI({ apiKey });
      const fallbackResponse = await aiFallback.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert PGA Golf Coach.",
        }
      });
      return fallbackResponse.text || "죄송합니다. 답변을 생성하는 데 실패했습니다.";
    } catch (fallbackError: any) {
      console.error("Fallback Gemini API Error:", fallbackError);
      return `코칭 정보를 가져오는 중 오류가 발생했습니다. (Error: ${error.message || "Unknown"})`;
    }
  }
}
