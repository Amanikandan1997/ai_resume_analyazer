import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { motion } from "framer-motion";
import constants, { buildPresenceChecklist } from "../constants";

import Robo from "./Robo";
import banner from "./banner11.png";
import LOGO from "./LOGO.png";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function App() {

  const logos = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      alt: "React",
    },
    {
      src: "https://vitejs.dev/logo.svg",
      alt: "Vite",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
      alt: "Tailwind CSS",
    },
    {
      src: "https://github.com/Amanikandan1997/Valluvar-Ai/blob/main/verce.png?raw=true",
      alt: "Vercel",
    },
    {
      src: "https://static.vecteezy.com/system/resources/previews/055/687/063/non_2x/circle-gemini-google-icon-symbol-logo-free-png.png",
      alt: "Gemini AI",
    },
    {
      src: "https://assets.puter.site/puter-logo.png",
      alt: "Puter.js",
    },
     {
      src: "https://static.vecteezy.com/system/resources/previews/022/227/364/non_2x/openai-chatgpt-logo-icon-free-png.png",
      alt: "openai",
    },
  ];

   const allLogos = [...logos, ...logos];

  const [aiReady, setAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [presenceChecklist, setPresenceChecklist] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const extractPDFText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textContent = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      const pageText = text.items.map((item) => item.str).join(" ");
      textContent.push(pageText);
    }

    return textContent.join("\n").trim();
  };

  const parseJsonResponse = (reply) => {
    try {
      const match = reply.match(/```json([\s\S]*?)```/);
      const jsonText = match ? match[1] : reply;
      const parsed = JSON.parse(jsonText);
      if (!parsed.overallScore && !parsed.error)
        throw new Error("Incomplete analysis data.");
      return parsed;
    } catch {
      throw new Error("Failed to parse AI response.");
    }
  };

  const analyzeResume = async (text) => {
    const prompt = constants.ANALYZE_RESUME_PROMPT.replace(
      "{{DOCUMENT_TEXT}}",
      text
    );

    const response = await window.puter.ai.chat(
      [
        { role: "system", content: "You are an expert resume analyzer." },
        { role: "user", content: prompt },
      ],
      { model: "gpt-4o" }
    );

    const message =
      typeof response === "string"
        ? response
        : response.message?.content || "";
    const result = parseJsonResponse(message);
    if (result.error) throw new Error(result.error);
    return result;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsLoading(true);
    setUploadedFile(file);
    try {
      const text = await extractPDFText(file);
      setResumeText(text);
      const analysisResult = await analyzeResume(text);
      setAnalysis(analysisResult);
      setPresenceChecklist(buildPresenceChecklist(text));
    } catch (error) {
      console.error("Error processing resume:", error);
      setAnalysis({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadRecreatedResume = () => {
    const blob = new Blob(
      [
        `
AI OPTIMIZED RESUME
--------------------
Name: ${uploadedFile?.name || "Candidate"}

Executive Summary:
${analysis.executiveSummary || "No summary available."}

Top Strengths:
${analysis.strengths?.join(", ")}

Recommended Keywords:
${analysis.recommendedKeywords?.join(", ")}

ATS Optimization Tips:
${analysis.atsOptimization?.join(", ")}

Free Tips:
${analysis.freeTips?.join(", ")}
`,
      ],
      { type: "text/plain" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "AI_Optimized_Resume.txt";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white overflow-x-hidden">
      {/* HERO SECTION */}
    <header className="fixed top-0 left-0 w-full /70 backdrop-blur-md border-b border-gray-800 z-50">
           <div className="container mx-auto px-8 py-4 flex items-center justify-between">
             {/* Logo Section */}
             <div className="flex items-center gap-2">
               <img
                 src={LOGO}
                 alt="Logo"
                 className="w-20 h-18 "
               /><p>Resume Ai Analyzer </p>
              
             </div>
   
             {/* Navigation + Buttons */}
             <div className="flex items-center gap-8 text-sm">
              
   
               <div className="flex items-center gap-3">
                
                 <motion.label className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 rounded-lg font-medium hover:opacity-90 transition">
                     {isLoading ? "Analyzing..." : "Upload Resume"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
                 </motion.label>
               </div>
             </div>
           </div>
           <div>
             
           </div>
                 

         </header>
     
      {!analysis && (
      <section className="relative grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-10 px-6 py-16 md:py-24 bg-[#0B0E14] overflow-hidden text-center md:text-left">
  {/* Left Column - Robo Animation */}
  <div
  className="p-8" 
  >
    <Robo />
  </div>

  {/* Right Column - Hero Text Section */}
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 1 }}
    className="relative z-10"
  >
    <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
      AI Resume Analyzer
    </h1>

    <p className="text-gray-300 mt-5 text-lg md:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed">
      Upload your resume and let AI boost your hiring potential with smart
      insights, keyword optimization, and ATS-friendly feedback.
    </p>

    <motion.label
      whileHover={{ scale: 1.05 }}
      className="mt-8 inline-block bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-blue-500 hover:to-indigo-500 cursor-pointer px-8 py-4 rounded-full shadow-xl font-semibold text-lg transition-all"
    >
      {isLoading ? "Analyzing..." : "Upload Resume PDF"}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
    </motion.label>
    
  </motion.div>

  {/* Floating Background Shapes */}
  <motion.div
    className="absolute top-0 left-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl"
    animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  />
  
  <motion.div
    className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
    animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
  />
</section>



      )}

      {/* ABOUT SECTION */}
      
      {!analysis && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-[#0B0E14] backdrop-blur-md text-center px-6"
        ><motion.div initial={{ opacity: 0, y: 80 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }} className="relative bottom-0 w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl group" > <motion.img src={banner} alt="AI workspace" className="w-full h-auto object-cover transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110" /> <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div> <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-indigo-500/40 transition-all duration-700"></div> </motion.div><br/>
          <h2 className="text-4xl font-bold text-blue-400 mb-4">
            About This Tool
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            The AI Resume Analyzer helps you understand how recruiters and ATS
            systems view your resume. It scans for missing sections, recommends
            powerful keywords, and gives you an overall score to help you stand
            out in competitive job markets.
          </p>
        </motion.section>
      )}<br/>

      {/* MARQUEE */}
      {!analysis && (
       <motion.div
        className="flex items-center gap-16 min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 25,
          repeat: Infinity,
        }}
      >
        {allLogos.map((logo, index) => (
          <img
            key={index}
            src={logo.src}
            alt={logo.alt}
            className="w-20 h-20 md:w-24 md:h-24 object-contain hover:scale-110 transition-transform duration-500"
          />
        ))}
      </motion.div>

      )}<br/><br/><br/>

      {/* RESULT SECTION */}
      {analysis && (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-xl p-8 mt-10 rounded-2xl shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-green-400 font-semibold">
                ✅ Analysis Complete
              </p>
              <p className="text-gray-300 text-sm">
                {uploadedFile ? uploadedFile.name : "Your Resume"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadRecreatedResume}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                ⬇ Download AI Resume
              </button>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setUploadedFile(null);
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                🔁 New Analysis
              </button>
            </div>
          </div>

          {/* Score Section Animation */}
          <motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 120 }}
  className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-2xl shadow-lg mb-6   justify-center items-center flex space-x-8"
>
  {/* Left Side – Score Info */}
  <div>
    <h2 className="text-xl mb-2 font-semibold text-white">Overall Score</h2>
    <p className="text-6xl font-bold text-white">
      {analysis.overallScore
        ? `${Math.round(analysis.overallScore / 10)}/10`
        : "N/A"}
    </p>

    <p className="mt-2 text-green-300 text-lg font-medium">
      {analysis.overallScore >= 80
        ? "Excellent"
        : analysis.overallScore >= 60
        ? "Good"
        : "Needs Improvement"}
    </p>
    
  </div> 

  {/* Right Side – Robo */}
  
</motion.div>


          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-indigo-800/40 rounded-xl p-5 mb-4"
          >
            <h3 className="text-lg font-semibold mb-2">🧠 Executive Summary</h3>
            <p className="text-sm text-gray-200">
              {analysis.executiveSummary ||
                "Your resume shows strong potential and relevant experience."}
            </p>
          </motion.div>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-emerald-700/40 rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-2">✅ Top Strengths</h3>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {analysis.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-amber-700/40 rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-2">⚠️ Improvements</h3>
              <ul className="list-disc ml-5 text-sm space-y-1">
                {analysis.improvements?.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Other sections remain same as before */}
          <div className="bg-teal-800/40 rounded-xl p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">🔍 Recommended Keywords</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {analysis.recommendedKeywords?.map((word, i) => (
                <span
                  key={i}
                  className="bg-emerald-600/30 px-3 py-1 rounded-full"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-purple-800/40 rounded-xl p-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">⚙️ ATS Optimization</h3>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {analysis.atsOptimization?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 bg-indigo-800/40 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">📋 ATS Checklist</h3>
            <ul className="text-sm grid grid-cols-2 gap-2">
              {presenceChecklist.map((item, idx) => (
                <li key={idx}>
                  {item.label}:{" "}
                  <span
                    className={`${
                      item.present ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {item.present ? "✓ Present" : "✗ Missing"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 bg-blue-800/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">💡 Free Tips</h3>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {(analysis.freeTips || [
                "Add measurable results to achievements.",
                "Keep formatting consistent.",
                "Include industry keywords.",
              ]).map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}

      {/* FOOTER */}
      {!analysis && (
        <footer className="text-center py-8 text-gray-400 text-sm bg-slate-950/70 mt-10">
          © {new Date().getFullYear()} AI Resume ATS  Analyzer · Developed by Manikandan UKI
       <p>Powerd By puter Js </p>
        </footer>
        
      )}
      <footer >
          
        </footer>
    </div>
  );
}

export default App;
