import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// --- Prompts (copied from constants.ts for self-containment) ---
const RESUME_ANALYSIS_PROMPT = `
Analyze the following resume text and provide a detailed evaluation.
The output MUST be a single, valid JSON object with the following keys: "summary", "strengths", "weaknesses", "improvements".
- "summary": A concise professional summary of the candidate (3-4 sentences).
- "strengths": An array of 3-5 key strengths based on the resume.
- "weaknesses": An array of 3-5 potential weaknesses or areas lacking detail.
- "improvements": An array of 3-5 actionable suggestions to improve the resume.
Do not include any introductory text or markdown formatting around the JSON object.
Resume Text:
---
{RESUME}
---
`;

const JD_ANALYSIS_PROMPT = `
Analyze the following job description text.
The output MUST be a single, valid JSON object with the following keys: "summary", "keySkills", "coreResponsibilities", "idealCandidateProfile".
- "summary": A short, human-readable summary of the role.
- "keySkills": An array of the most critical technical and soft skills required.
- "coreResponsibilities": An array of the main duties and responsibilities.
- "idealCandidateProfile": A string describing the ideal candidate's background and experience.
Do not include any introductory text or markdown formatting around the JSON object.
Job Description Text:
---
{JD}
---
`;

const MATCH_ANALYSIS_PROMPT = `
Analyze and compare the following resume against the job description.
The output MUST be a single, valid JSON object with the following keys: "atsScore", "atsFeedback", "atsScoreBreakdown", "fitScore", "matchedSkills", "missingSkills", "fitSummary".
- "atsScore": An estimated ATS (Applicant Tracking System) score from 0 to 100.
- "atsFeedback": A single string providing general feedback on how to improve the ATS score.
- "atsScoreBreakdown": An array of objects, each representing a component of the ATS score. Each object MUST have keys: "component" (string, e.g., "Keyword Match"), "weight" (string, e.g., "60%"), "score" (number, the calculated score for this component), and "reasoning" (string, a brief explanation and suggestion for improvement). The components should be: Keyword Match, Resume Formatting, Language & Tone, Job Role Relevance.
- "fitScore": A suitability score from 0 to 100 indicating how well the candidate fits the role.
- "matchedSkills": An array of skills present in both the resume and JD.
- "missingSkills": An array of key skills from the JD missing from the resume.
- "fitSummary": A concluding summary of why the candidate is or is not a good fit.
Do not include any introductory text or markdown formatting around the JSON object.
Resume Text:
---
{RESUME}
---
Job Description Text:
---
{JD}
---
`;

// --- Handler Logic ---
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'The Gemini API key is not set up. Please contact the administrator.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, resumeText, jdText } = body;

    if (!type || !resumeText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: type and resumeText.' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    let prompt = '';

    switch (type) {
      case 'resume':
        prompt = RESUME_ANALYSIS_PROMPT.replace('{RESUME}', resumeText);
        break;
      case 'jd':
        prompt = JD_ANALYSIS_PROMPT.replace('{JD}', jdText);
        break;
      case 'fit':
        if (!jdText) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing jdText for fit analysis.' }),
          };
        }
        prompt = MATCH_ANALYSIS_PROMPT.replace('{RESUME}', resumeText).replace('{JD}', jdText);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid analysis type.' }),
        };
    }
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "The AI returned an empty response. This might be due to a content policy." })
        };
    }

    // Validate that the AI response is valid JSON
    try {
      JSON.parse(text);
    } catch (jsonErr) {
      console.error('Invalid JSON from AI:', text);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'The AI returned invalid JSON. Please try again or adjust your input.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: text, // The response from Gemini is already a stringified JSON
    };

  } catch (error) {
    console.error('Error in serverless function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal server error occurred.' }),
    };
  }
};

export { handler };
