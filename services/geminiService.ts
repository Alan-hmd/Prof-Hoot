import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { GeneratedLessonResponse, GeneratedQuizResponse, TeksStandard, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

// System instructions for the "Teacher" persona
const TEACHER_PERSONA = `
You are Professor Hoot, a friendly, encouraging, and wise owl who teaches 5th-grade math to students in Texas. 
Your tone is playful, clear, and age-appropriate (10-11 years old).
You love using bird puns occasionally (e.g., "Owl bet you can do this!", "Whooo's ready to learn?").
Explain concepts simply, step-by-step.
`;

export const generateLesson = async (teks: TeksStandard): Promise<GeneratedLessonResponse> => {
  const prompt = `
    Create a 3-slide lesson for the Texas standard: ${teks.code} - ${teks.description}.
    
    Structure:
    1. Introduction: Hook the student with a real-world example.
    2. Explanation: Step-by-step how-to.
    3. Example: Walk through a specific problem.

    Output pure JSON following this schema. Visual types can be 'chart', 'geometry', 'text' or 'calculation'.
    If 'chart', provide 'visualData' suitable for a Recharts bar chart (e.g., [{name: 'A', value: 10}]).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: TEACHER_PERSONA,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  visualType: { type: Type.STRING, enum: ['chart', 'text', 'calculation', 'geometry'] },
                  visualData: { 
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, value: {type: Type.NUMBER} } },
                    nullable: true
                  }
                },
                required: ['title', 'content', 'visualType']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as GeneratedLessonResponse;

  } catch (error) {
    console.error("Error generating lesson:", error);
    // Fallback content in case of API failure
    return {
      slides: [
        {
          title: "Oops!",
          content: "Professor Hoot is having trouble finding his notes. Please try again in a moment.",
          visualType: "text"
        }
      ]
    };
  }
};

export const generateQuiz = async (teks: TeksStandard): Promise<GeneratedQuizResponse> => {
  const prompt = `
    Create a quiz with 3 multiple-choice questions for 5th grade math standard: ${teks.code}.
    Questions should be progressively harder.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: TEACHER_PERSONA,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as GeneratedQuizResponse;

  } catch (error) {
    console.error("Error generating quiz:", error);
    return { questions: [] };
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    // We strictly use gemini-2.5-flash-preview-tts for TTS
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly voice
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;

  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// Chat functionality
let chatSession: Chat | null = null;

export const sendMessageToTutor = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    // We create a new chat session if one doesn't exist, or if the history is cleared
    // Note: In a stateless request architecture we might recreate it, but for simple state management here:
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: TEACHER_PERSONA + "\nKeep answers concise and helpful for a 5th grader. Use formatting like bullet points if needed.",
        }
      });
    }

    // Note: The history passed in `history` arg is for UI display.
    // The `chatSession` object maintains its own history in the SDK.
    // If we wanted to sync them perfectly we could recreate the chat with `history` mapped to content,
    // but simply sending the message to the persistent session object is usually sufficient for a single session.
    
    const result = await chatSession.sendMessage({ message: newMessage });
    return result.text || "I'm not sure what to say to that, hoot!";
  } catch (error) {
    console.error("Chat error:", error);
    return "Whoops! I got a bit confused. Can you ask that again?";
  }
};
