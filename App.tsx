import React, { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { AnalysisTab } from './types';
import type { AnalysisResults } from './types';
import { analyzeResume, analyzeJobDescription, analyzeFit } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';
import TabButton from './components/TabButton';
import Spinner from './components/Spinner';

// Configure the worker for pdf.js using a reliable CDN like unpkg
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jdFileName, setJdFileName] = useState('');
  const [activeTab, setActiveTab] = useState<AnalysisTab>(AnalysisTab.MATCH_ANALYSIS);
  const [results, setResults] = useState<AnalysisResults>({ resumeAnalysis: null, jdAnalysis: null, matchAnalysis: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TABS_CONFIG = {
    [AnalysisTab.MATCH_ANALYSIS]: { icon: '🤝', label: AnalysisTab.MATCH_ANALYSIS },
    [AnalysisTab.ATS_SCORE]: { icon: '📊', label: AnalysisTab.ATS_SCORE },
    [AnalysisTab.RESUME_ANALYSIS]: { icon: '📄', label: AnalysisTab.RESUME_ANALYSIS },
    [AnalysisTab.JD_ANALYSIS]: { icon: '📋', label: AnalysisTab.JD_ANALYSIS },
  };
    
  const TABS = Object.values(AnalysisTab);

  const isAnalyzeButtonDisabled = !resumeText.trim() || !jdText.trim() || isLoading;

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    setText: React.Dispatch<React.SetStateAction<string>>,
    setFileName: React.Dispatch<React.SetStateAction<string>>,
    setIsParsing: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Allow re-uploading the same file

    if (!file) return;

    setIsParsing(true);
    setError(null);
    setText('');
    setFileName(file.name);

    try {
      let content = '';
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
        }
        content = textContent;
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        content = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      }
      
      setText(content);
      setFileName(file.name);
    } catch (err) {
        console.error("File parsing error:", err);
        const message = err instanceof Error ? err.message : 'An unknown error occurred during file parsing.';
        setError(`Failed to read file: ${message}`);
        setText('');
        setFileName('');
    } finally {
        setIsParsing(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (isAnalyzeButtonDisabled) return;

    setIsLoading(true);
    setError(null);
    setResults({ resumeAnalysis: null, jdAnalysis: null, matchAnalysis: null });
    
    if (!process.env.API_KEY) {
      setError("Configuration Error: The Gemini API key is not set up. Please contact the administrator.");
      setIsLoading(false);
      return;
    }

    try {
      const [resumeAnalysis, jdAnalysis, matchAnalysis] = await Promise.all([
        analyzeResume(resumeText),
        analyzeJobDescription(jdText),
        analyzeFit(resumeText, jdText)
      ]);
      setResults({ resumeAnalysis, jdAnalysis, matchAnalysis });
      setActiveTab(AnalysisTab.MATCH_ANALYSIS);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, jdText, isAnalyzeButtonDisabled]);
    
  return (
    <div className="min-h-screen text-slate-800">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">AI HR Assistant</h1>
              </div>
              <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzeButtonDisabled}
                  className="flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300"
              >
                  {isLoading ? <Spinner size={5} className="text-white"/> : 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>}
                  <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
              </button>
          </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">📄 Resume</h2>
                <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(e) => handleFileChange(e, setResumeText, setResumeFileName, setIsParsingResume)}/>
                <button 
                  onClick={() => resumeInputRef.current?.click()} 
                  disabled={isParsingResume || isParsingJd}
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md py-1 px-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isParsingResume ? <Spinner size={5} /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                  <span>{isParsingResume ? 'Parsing...' : 'Upload File'}</span>
                </button>
              </div>
              {resumeFileName && (
                <div className="mb-4 p-2.5 bg-slate-100 rounded-md text-sm text-slate-700 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 truncate"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg><span className="truncate" title={resumeFileName}>{resumeFileName}</span></div>
                  <button onClick={() => { setResumeText(''); setResumeFileName(''); }} className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0" aria-label="Remove file"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                </div>
              )}
              <textarea value={resumeText} onChange={(e) => { setResumeText(e.target.value); if (resumeFileName) setResumeFileName(''); }} placeholder="Upload a candidate's resume (.pdf, .docx, .txt) or simply paste the text here to get started." className="w-full flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none text-sm text-slate-700 bg-slate-50" style={{minHeight: '24rem'}}/>
            </div>

            {/* Job Description Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">📋 Job Description</h2>
                <input type="file" ref={jdInputRef} className="hidden" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(e) => handleFileChange(e, setJdText, setJdFileName, setIsParsingJd)}/>
                <button 
                  onClick={() => jdInputRef.current?.click()} 
                  disabled={isParsingResume || isParsingJd}
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md py-1 px-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isParsingJd ? <Spinner size={5} /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                  <span>{isParsingJd ? 'Parsing...' : 'Upload File'}</span>
                </button>
              </div>
              {jdFileName && (
                <div className="mb-4 p-2.5 bg-slate-100 rounded-md text-sm text-slate-700 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2 truncate"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg><span className="truncate" title={jdFileName}>{jdFileName}</span></div>
                  <button onClick={() => { setJdText(''); setJdFileName(''); }} className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0" aria-label="Remove file"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                </div>
              )}
              <textarea value={jdText} onChange={(e) => { setJdText(e.target.value); if (jdFileName) setJdFileName(''); }} placeholder="Now add the job description. Upload a file or paste the text. The more detail, the better the analysis." className="w-full flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none text-sm text-slate-700 bg-slate-50" style={{minHeight: '24rem'}}/>
            </div>
          </div>
          
          {error && !isLoading && (
            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-r-lg shadow" role="alert">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
            </div>
          )}

          <div className="mt-10">
              <div className="flex justify-center flex-wrap gap-2 p-1.5 bg-slate-200 rounded-xl">
                  {TABS.map((tab) => {
                    const config = TABS_CONFIG[tab];
                    return (
                      <TabButton
                          key={tab}
                          label={config.label}
                          icon={<span>{config.icon}</span>}
                          isActive={activeTab === tab}
                          onClick={() => setActiveTab(tab)}
                      />
                  )})}
              </div>
              <AnalysisDisplay 
                results={results} 
                activeTab={activeTab} 
                isLoading={isLoading} 
                error={isLoading ? error : null}
              />
          </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-500">
          <p>Powered by 🚀 Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;