export enum AnalysisTab {
  MATCH_ANALYSIS = 'Resume vs JD Match',
  ATS_SCORE = 'ATS Score',
  RESUME_ANALYSIS = 'Resume Analysis',
  COVER_LETTER = 'Cover Letter',
}

export interface ResumeAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface JobDescriptionAnalysis {
  summary: string;
  keySkills: string[];
  coreResponsibilities: string[];
  idealCandidateProfile: string;
}

export interface AtsScoreComponent {
    component: string;
    weight: string;
    score: number;
    reasoning: string;
}

export interface MatchAnalysis {
  atsScore: number;
  atsFeedback: string;
  atsScoreBreakdown: AtsScoreComponent[];
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  fitSummary: string;
}

export interface CoverLetterResult {
  coverLetter: string;
  tone: string;
}

export interface AnalysisResults {
  resumeAnalysis: ResumeAnalysis | null;
  coverLetterResult: CoverLetterResult | null;
  matchAnalysis: MatchAnalysis | null;
}