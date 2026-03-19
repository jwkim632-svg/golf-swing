import { GoogleGenAI } from "@google/genai";

export async function askGolfCoach(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("GEMINI_API_KEY is missing or invalid");
    return "AI 코치 서비스가 아직 설정되지 않았습니다. 관리자에게 문의하거나 API 키 설정을 확인해주세요.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Using gemini-3.1-pro-preview for better reasoning and reliability
    const model = "gemini-3.1-pro-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an expert PGA Golf Coach. Explain golf swing mechanics clearly and technically. Keep responses concise and use markdown. Answer in Korean.",
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });
    
    if (!response.text) {
      return "코치가 현재 답변을 드릴 수 없는 상태입니다. 잠시 후 다시 시도해주세요.";
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "코칭 정보를 가져오는 중 오류가 발생했습니다.";
    
    if (error.message?.includes("404")) {
      errorMessage += " (모델을 찾을 수 없습니다. 설정을 확인해주세요.)";
    } else if (error.message?.includes("401") || error.message?.includes("403")) {
      errorMessage += " (인증 오류: API 키가 올바르지 않거나 권한이 없습니다.)";
    } else if (error.message?.includes("429")) {
      errorMessage += " (사용량이 너무 많습니다. 잠시 후 다시 시도해주세요.)";
    } else {
      errorMessage += ` (Error: ${error.message || "Unknown"})`;
    }
    
    return errorMessage;
  }
}
