import React from 'react';
import type { AnalysisResults, ResumeAnalysis, JobDescriptionAnalysis, MatchAnalysis, AtsScoreComponent, CoverLetterResult } from '../types';
import ScoreGauge from './ScoreGauge';
import Spinner from './Spinner';
import jsPDF from 'jspdf';

interface AnalysisDisplayProps {
  results: AnalysisResults;
  activeTab: string;
  isLoading: boolean;
  error: string | null;
}

const AnalysisCard: React.FC<{ title: string; children: React.ReactNode; icon?: string }> = ({ title, children, icon }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200">
    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">{icon && <span className="text-2xl">{icon}</span>} {title}</h3>
    {children}
  </div>
);

const ListSection: React.FC<{ title: string; items: string[]; itemClass?: string; icon?: React.ReactNode; }> = ({ title, items, itemClass = 'bg-slate-100', icon }) => (
  <div>
    <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">{icon}{title}</h4>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className={`p-3 rounded-lg text-sm text-slate-800 ${itemClass}`}>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

// PDF Template Utility
export function applyPdfTemplate(doc: jsPDF, title: string) {
  // Light paper background
  doc.setFillColor(245, 240, 230); // light beige
  doc.rect(0, 0, 210, 297, 'F'); // A4 size in mm
  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(60, 60, 120);
  doc.text(title, 105, 25, { align: 'center' });
  // Divider
  doc.setDrawColor(180, 180, 180);
  doc.line(30, 30, 180, 30);
  // Reset font for body
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
}

const handleResumeAnalysisPDF = (data: ResumeAnalysis) => {
  const doc = new jsPDF();
  applyPdfTemplate(doc, 'Resume Analysis');
  let y = 40;
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('Summary:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(data.summary, 150), 30, y);
  y += 16;
  doc.setFont('times', 'bold');
  doc.text('Key Strengths:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  data.strengths.forEach((s) => { doc.text('- ' + s, 35, y); y += 7; });
  y += 4;
  doc.setFont('times', 'bold');
  doc.text('Potential Weaknesses:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  data.weaknesses.forEach((w) => { doc.text('- ' + w, 35, y); y += 7; });
  y += 4;
  doc.setFont('times', 'bold');
  doc.text('Improvement Suggestions:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  data.improvements.forEach((i) => { doc.text('- ' + i, 35, y); y += 7; });
  doc.save('resume_analysis.pdf');
};

const handleMatchAnalysisPDF = (data: MatchAnalysis) => {
  const doc = new jsPDF();
  applyPdfTemplate(doc, 'Resume vs JD Match');
  let y = 40;
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('ATS Score: ' + data.atsScore, 30, y);
  y += 8;
  doc.text('Fit Score: ' + data.fitScore, 30, y);
  y += 8;
  doc.text('Fit Summary:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(data.fitSummary, 150), 30, y);
  y += 16;
  doc.setFont('times', 'bold');
  doc.text('Matched Skills:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  data.matchedSkills.forEach((s) => { doc.text('- ' + s, 35, y); y += 7; });
  y += 4;
  doc.setFont('times', 'bold');
  doc.text('Missing Skills:', 30, y);
  y += 8;
  doc.setFont('times', 'normal');
  data.missingSkills.forEach((s) => { doc.text('- ' + s, 35, y); y += 7; });
  doc.save('match_analysis.pdf');
};

const handleATSScorePDF = (data: MatchAnalysis) => {
  const doc = new jsPDF();
  applyPdfTemplate(doc, 'ATS Score Breakdown');
  let y = 40;
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  data.atsScoreBreakdown.forEach((item) => {
    doc.text(item.component + ' (' + item.weight + '): ' + item.score, 30, y);
    y += 7;
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.text('Reasoning: ' + item.reasoning, 35, y);
    y += 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
  });
  doc.text('Total ATS Score: ' + data.atsScore, 30, y);
  doc.save('ats_score.pdf');
};

const handleCoverLetterPDF = (data: CoverLetterResult) => {
  const doc = new jsPDF();
  applyPdfTemplate(doc, 'Cover Letter');
  let y = 40;
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Tone: ${data.tone}`, 30, y);
  y += 10;
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  const lines = doc.splitTextToSize(data.coverLetter, 150);
  doc.text(lines, 30, y);
  doc.save('cover_letter.pdf');
};

const ResumeAnalysisView: React.FC<{ data: ResumeAnalysis }> = ({ data }) => (
  <div className="space-y-6">
    <button onClick={() => handleResumeAnalysisPDF(data)} className="bg-indigo-100 px-3 py-2 rounded-md font-medium hover:bg-indigo-200 mb-2">Generate PDF</button>
    <blockquote className="p-4 bg-slate-100 border-l-4 border-indigo-400 text-slate-600 rounded-r-lg">"{data.summary}"</blockquote>
    <ListSection title="Key Strengths" items={data.strengths} icon={<span className="text-green-500">👍</span>} itemClass="bg-green-50 border border-green-200" />
    <ListSection title="Potential Weaknesses" items={data.weaknesses} icon={<span className="text-yellow-500">🤔</span>} itemClass="bg-yellow-50 border border-yellow-200" />
    <ListSection title="Improvement Suggestions" items={data.improvements} icon={<span className="text-blue-500">💡</span>} itemClass="bg-blue-50 border border-blue-200" />
  </div>
);

const JDAnalysisView: React.FC<{ data: JobDescriptionAnalysis }> = ({ data }) => (
  <div className="space-y-6">
    <blockquote className="p-4 bg-slate-100 border-l-4 border-indigo-400 text-slate-600 rounded-r-lg">"{data.summary}"</blockquote>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListSection title="Key Skills" items={data.keySkills} icon={<span>🔑</span>} />
        <ListSection title="Core Responsibilities" items={data.coreResponsibilities} icon={<span>🎯</span>} />
    </div>
    <div>
        <h4 className="text-md font-semibold text-slate-700 mb-2 flex items-center gap-2">⭐ Ideal Candidate Profile</h4>
        <p className="p-4 rounded-lg text-sm text-slate-800 bg-slate-100 border border-slate-200">{data.idealCandidateProfile}</p>
    </div>
  </div>
);

const MatchAnalysisView: React.FC<{ data: MatchAnalysis }> = ({ data }) => (
  <div className="space-y-8">
    <button onClick={() => handleMatchAnalysisPDF(data)} className="bg-indigo-100 px-3 py-2 rounded-md font-medium hover:bg-indigo-200 mb-2">Generate PDF</button>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ScoreGauge score={data.atsScore} label="ATS Score" />
      <ScoreGauge score={data.fitScore} label="Candidate Fit Score" />
    </div>
    <blockquote className="p-4 bg-slate-100 border-l-4 border-indigo-400 text-slate-600 rounded-r-lg italic">"{data.fitSummary}"</blockquote>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListSection title="Matched Skills" items={data.matchedSkills} icon={<span className="text-lg">✅</span>} itemClass="bg-green-50 border border-green-200"/>
        <ListSection title="Missing Skills" items={data.missingSkills} icon={<span className="text-lg">❌</span>} itemClass="bg-red-50 border border-red-200"/>
    </div>
  </div>
);

const ATSScoreView: React.FC<{ data: MatchAnalysis }> = ({ data }) => (
  <div className="space-y-8">
    <button onClick={() => handleATSScorePDF(data)} className="bg-indigo-100 px-3 py-2 rounded-md font-medium hover:bg-indigo-200 mb-2">Generate PDF</button>
    <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-slate-200">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            <th scope="col" className="px-6 py-3">Component</th>
            <th scope="col" className="px-6 py-3 text-center">Weight</th>
            <th scope="col" className="px-6 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.atsScoreBreakdown.map((item) => (
            <tr key={item.component} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
              <th scope="row" className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{item.component}</th>
              <td className="px-6 py-4 text-center">{item.weight}</td>
              <td className="px-6 py-4 text-right font-semibold">{item.score}</td>
            </tr>
          ))}
           <tr className="bg-slate-100 font-bold">
            <td className="px-6 py-4">Total ATS Score</td>
            <td className="px-6 py-4 text-center">100%</td>
            <td className="px-6 py-4 text-right text-lg text-indigo-600">{data.atsScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">💡 Points for Improvement</h4>
      <div className="space-y-4">
        {data.atsScoreBreakdown.map((item) => (
          <div key={item.component} className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <p className="font-semibold text-blue-800">{item.component}</p>
            <p className="text-sm text-blue-700">{item.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CoverLetterView: React.FC<{ data: CoverLetterResult }> = ({ data }) => (
  <div className="space-y-6">
    <button onClick={() => handleCoverLetterPDF(data)} className="bg-indigo-100 px-3 py-2 rounded-md font-medium hover:bg-indigo-200 mb-2">Generate PDF</button>
    <blockquote className="p-4 bg-slate-100 border-l-4 border-indigo-400 text-slate-600 rounded-r-lg whitespace-pre-line">{data.coverLetter}</blockquote>
    <div className="text-sm text-slate-500">Tone: {data.tone}</div>
  </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ results, activeTab, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-80 gap-4">
          <Spinner size={12} />
          <p className="text-slate-600 font-medium animate-pulse text-lg">AI is analyzing... this may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-80 gap-4 text-center p-4">
            <div className="text-red-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-600">Analysis Failed</h3>
            <p className="text-slate-600 max-w-md">{error}</p>
        </div>
      );
    }
    
    if (!results.resumeAnalysis && !results.coverLetterResult && !results.matchAnalysis) {
       return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center p-4">
            <svg className="w-40 h-40 text-indigo-200" viewBox="0 0 255 182" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M213.333 48H41.6667C29.3333 48 20.4167 58 20.4167 70L20 160C20 172 29.3333 182 41.6667 182H213.333C225.667 182 235 172 235 160V70C235 58 225.667 48 213.333 48Z" fill="#A5B4FC"/><path d="M213.333 2H41.6667C29.3333 2 20 12 20 24V114" stroke="#818CF8" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M96.6667 86L127.5 116L213.333 34" stroke="#C7D2FE" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/></svg>
           <h3 className="text-2xl font-bold text-slate-700 mt-4">Ready for Analysis</h3>
           <p className="text-slate-500 max-w-md">Upload or paste a resume and job description, then click "Analyze" to see the magic happen!</p>
        </div>
       );
    }
    
    switch (activeTab) {
      case 'Resume Analysis':
        if (!results.resumeAnalysis) return null;
        return <AnalysisCard title="Resume Analysis" icon="📄"><ResumeAnalysisView data={results.resumeAnalysis} /></AnalysisCard>;
      case 'Cover Letter':
        if (!results.coverLetterResult) return null;
        return <AnalysisCard title="Cover Letter" icon="✉️"><CoverLetterView data={results.coverLetterResult} /></AnalysisCard>;
      case 'Resume vs JD Match':
        if (!results.matchAnalysis) return null;
        return <AnalysisCard title="Resume vs. JD Match" icon="🤝"><MatchAnalysisView data={results.matchAnalysis} /></AnalysisCard>;
      case 'ATS Score':
        if (!results.matchAnalysis) return null;
        return <AnalysisCard title="ATS Score Breakdown" icon="📊"><ATSScoreView data={results.matchAnalysis} /></AnalysisCard>;
      default:
        return null;
    }
  };

  return <div className="mt-6 animate-fade-in">{renderContent()}</div>;
};

export default AnalysisDisplay;