import { GoogleGenAI } from "@google/genai";

export async function askGolfCoach(prompt: string) {
  // Access the API key - it should be injected via vite.config.ts
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("GEMINI_API_KEY is missing");
    return "AI 코치 서비스의 API 키가 설정되지 않았습니다. AI Studio의 'Settings > Secrets'에서 GEMINI_API_KEY를 추가해 주세요.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Using gemini-3-flash-preview which is the standard free model
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert PGA Golf Coach. Explain golf swing mechanics clearly and technically. Keep responses concise and use markdown. Answer in Korean.",
        temperature: 0.7,
      }
    });
    
    if (!response.text) {
      return "코치가 현재 답변을 드릴 수 없는 상태입니다. 잠시 후 다시 시도해주세요.";
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Handle common API errors with user-friendly messages
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("401") || error.message?.includes("403")) {
      return "API 키가 유효하지 않거나 권한이 없습니다. AI Studio의 Secrets 설정을 다시 확인해 주세요.";
    }
    
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return "사용량이 너무 많아 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.";
    }

    return `코칭 정보를 가져오는 중 오류가 발생했습니다. (Error: ${error.message || "Unknown Error"})`;
  }
}
