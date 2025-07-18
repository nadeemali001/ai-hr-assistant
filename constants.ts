export const RESUME_ANALYSIS_PROMPT = `
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

export const JD_ANALYSIS_PROMPT = `
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

export const MATCH_ANALYSIS_PROMPT = `
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