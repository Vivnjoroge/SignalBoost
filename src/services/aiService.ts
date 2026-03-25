import { GoogleGenAI, Type } from "@google/genai";
import { StorySubmission } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processStory(submission: StorySubmission) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following community story submission and provide structured data for a platform called StorySasa.
    
    Title: ${submission.title}
    Category: ${submission.category}
    Location: ${submission.location}
    Description: ${submission.description}
    
    Tasks:
    1. Generate a 2-3 line concise summary.
    2. Extract 3-5 relevant tags.
    3. Calculate an Impact Score (1-100) based on Urgency, Number of people affected (Reach), and Community Relevance.
    4. Determine a Verification Level (Low, Medium, High) based on the clarity, detail, and internal consistency of the description.
    5. Provide a brief impact breakdown explanation.
    
    Note: Categories include Emergency, Infrastructure, Community Issue, Health, Education, Environment, Innovation, Other.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            impactScore: { type: Type.INTEGER },
            impactBreakdown: {
              type: Type.OBJECT,
              properties: {
                urgency: { type: Type.INTEGER },
                reach: { type: Type.INTEGER },
                relevance: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["urgency", "reach", "relevance", "explanation"]
            },
            verificationLevel: { 
              type: Type.STRING,
              enum: ["Low", "Medium", "High"]
            }
          },
          required: ["summary", "tags", "impactScore", "impactBreakdown", "verificationLevel"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("AI Processing Error:", error);
    // Fallback mock logic if AI fails
    return {
      summary: submission.description.slice(0, 150) + "...",
      tags: [submission.category, "Community"],
      impactScore: 50,
      impactBreakdown: {
        urgency: 50,
        reach: 50,
        relevance: 50,
        explanation: "Automated analysis pending."
      },
      verificationLevel: "Medium"
    };
  }
}
