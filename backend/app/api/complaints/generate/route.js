
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const SYSTEM_PROMPT = `
You are CyberHelp, an assistant that prepares formal cybercrime
complaint drafts for users in India.

Prepare a professional, clear and properly structured complaint.

Rules:
1. Use only information provided in the conversation.
2. Never invent names, dates, amounts, locations or other details.
3. Do not assume any missing information.
4. Include the incident description, platform, date and time,
   suspect information, financial loss, evidence and complainant
   details wherever those details were provided.
5. Clearly mention unavailable information as "Not provided"
   where appropriate.
6. Use formal and respectful language.
7. Do not claim that the complaint has been officially submitted.
8. Never include passwords, OTPs, PINs, CVVs or complete banking
   credentials.
9. Keep the complaint in the requested language.
10. Return only the complaint draft, without additional commentary.
`;

function getStatusCode(error) {
  return Number(
    error?.status ??
    error?.error?.code ??
    error?.response?.status ??
    0
  );
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function generateWithRetry(contents, selectedLanguage) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

        contents,

        config: {
          systemInstruction:
            SYSTEM_PROMPT +
            `\nWrite the complaint in ${selectedLanguage}.`,
          temperature: 0.2
        }
      });

    } catch (error) {
      const status = getStatusCode(error);

      const retryable = [429, 500, 502, 503, 504].includes(status);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * (2 ** (attempt - 1));

      console.log(
        `Complaint generation failed with ${status}. Retrying in ${delay}ms.`
      );

      await wait(delay);
    }
  }

  throw new Error("Complaint generation failed.");
}

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      history = [],
      language = "en"
    } = body;

    if (
      !Array.isArray(history) ||
      history.length === 0 ||
      history.length > 40 ||
      history.length % 2 !== 0
    ) {
      return Response.json(
        { error: "Invalid conversation history." },
        { status: 400 }
      );
    }

    const validHistory = history.every((item, index) => {
      const expectedRole =
        index % 2 === 0 ? "user" : "model";

      return (
        item &&
        item.role === expectedRole &&
        typeof item.text === "string" &&
        item.text.length <= 3000
      );
    });

    if (!validHistory) {
      return Response.json(
        { error: "Invalid conversation history format." },
        { status: 400 }
      );
    }

    const selectedLanguage =
      language === "hi" ? "Hindi" : "English";

    // Convert the existing conversation into Gemini format.
    const geminiHistory = history.map(item => ({
      role: item.role,
      parts: [{ text: item.text }]
    }));

    // IMPORTANT: Add a final USER turn.
    // The previous history ends with a MODEL turn.
    const contents = [
      ...geminiHistory,
      {
        role: "user",
        parts: [
          {
            text: `
Please prepare a formal cybercrime complaint draft
using all the information provided in our conversation.

Include the available incident details, platform,
date and time, description, financial loss, suspect
information, evidence and complainant details.

Do not invent missing information.

Write the complete complaint in ${selectedLanguage}.

Return only the formal complaint draft.
`
          }
        ]
      }
    ];

    const result = await generateWithRetry(
      contents,
      selectedLanguage
    );

    const draft = result.text?.trim();

    if (!draft) {
      throw new Error("Gemini returned an empty complaint draft.");
    }

    return Response.json({
      success: true,
      draft
    });

  } catch (error) {
    console.error("Complaint generation error:", error);

    const status = getStatusCode(error);

    if (status === 503 || status === 429) {
      return Response.json(
        {
          error: "Gemini is temporarily busy. Please try again shortly."
        },
        { status }
      );
    }

    return Response.json(
      {
        error: "The complaint draft could not be generated. Please try again."
      },
      { status: status >= 400 && status <= 599 ? status : 500 }
    );
  }
}
