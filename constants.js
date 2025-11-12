// constants.js

const constants = {
  ANALYZE_RESUME_PROMPT: `
You are an expert resume analyzer. Analyze the following resume text and return a JSON
object inside triple backticks (\`\`\`json ... \`\`\`) with these fields:

{
  "overallScore": number (0-100),
  "executiveSummary": string,
  "strengths": [array of strings],
  "improvements": [array of strings],
  "recommendedKeywords": [array of strings],
  "atsOptimization": [array of strings],
  "freeTips": [array of strings]
}

Evaluate structure, readability, keyword presence, ATS compatibility, and
presentation clarity. Provide helpful and encouraging feedback.
Resume text below:
--------------------
{{DOCUMENT_TEXT}}
  `
};

// Build checklist of presence indicators (ATS essentials)
export function buildPresenceChecklist(text = "") {
  const lower = text.toLowerCase();
  const checklist = [
    { label: "Contact Information", present: /@|phone|contact|linkedin|gmail|email/.test(lower) },
    { label: "Summary / Objective", present: /objective|summary|about/i.test(text) },
    { label: "Skills Section", present: /skills|technologies|tools/i.test(text) },
    { label: "Work Experience", present: /experience|employment|projects/i.test(text) },
    { label: "Education", present: /education|degree|university|college/i.test(text) },
    { label: "Certifications", present: /certification|course|training/i.test(text) },
    { label: "Achievements", present: /achievements|awards|recognition/i.test(text) },
    { label: "Keywords / Tech Stack", present: /(react|node|python|aws|java|sql|html|css|javascript)/i.test(text) },
    { label: "Projects", present: /projects|portfolio|case study/i.test(text) },
    { label: "Soft Skills", present: /communication|leadership|teamwork|problem|creative/i.test(text) }
  ];
  return checklist;
}

export default constants;
