import type { ResumeAnalysis, JobDescriptionAnalysis, MatchAnalysis, CoverLetterResult } from '../types';

const generateContent = async <T,>(type: 'resume' | 'jd' | 'fit' | 'coverLetter', resumeText: string, jdText?: string): Promise<T> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, resumeText, jdText }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(`Failed to get analysis from AI: ${errorData.error || response.statusText}`);
    }

    // The serverless function already returns JSON, so we just parse it.
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("API Service Error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};

export const analyzeResume = (resume: string): Promise<ResumeAnalysis> => {
  return generateContent<ResumeAnalysis>('resume', resume);
};

export const analyzeJobDescription = (jd: string): Promise<JobDescriptionAnalysis> => {
  // Although the JD prompt doesn't need the resume, our function expects it.
  // We pass a placeholder value.
  return generateContent<JobDescriptionAnalysis>('jd', 'placeholder', jd);
};

export const analyzeFit = (resume: string, jd: string): Promise<MatchAnalysis> => {
  return generateContent<MatchAnalysis>('fit', resume, jd);
};

export const generateCoverLetter = async (jdText: string, tone: string): Promise<CoverLetterResult> => {
  console.log('generateCoverLetter called with:', { jdText, tone });
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'coverLetter', jdText, tone }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
      throw new Error(`Failed to get cover letter from AI: ${errorData.error || response.statusText}`);
    }
    const data = await response.json();
    return data as CoverLetterResult;
  } catch (error) {
    console.error('API Service Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while communicating with the server.');
  }
};
