import express from 'express';
import fetch from 'node-fetch';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const API_KEY = process.env.TYPHOON_API_KEY;
const API_URL = 'https://api.opentyphoon.ai/v1/chat/completions';

router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const { jobReq, candidates } = req.body;

    if (!jobReq || !candidates || candidates.length === 0) {
      return res.status(400).json({ error: 'Job requirements and candidates are required.' });
    }

    // Limit to 200 candidates per request to avoid payload limits
    const safeCandidates = candidates.slice(0, 200);

    const matchPrompt = `
You are an expert HR AI Assistant. Your task is to evaluate a pool of candidates against a specific job requirement.

Job Requirement:
"${jobReq}"

Candidate Pool (JSON):
${JSON.stringify(safeCandidates, null, 2)}

=== EVALUATION RULES (MUST FOLLOW STRICTLY) ===

1. ROLE MATCHING (CRITICAL): Check if the user specified a job title/role (e.g., "Software Engineer"). If the candidate's \`currentRole\` is fundamentally different (e.g. "Data Scientist", "Product Manager", "HR Manager") when a specific role is requested, heavily penalize them (-40 points). The top candidates MUST have a matching or highly related \`currentRole\`.

2. EDUCATION PRIORITY (CRITICAL): If the job requirement mentions a specific education level (e.g. "Master's Degree", "ปริญญาโท", "PhD"), candidates who meet or EXCEED that education level MUST be ranked HIGHER than those who do not. A candidate with lower education receives a severe score penalty (-30 points).

3. SKILL MATCHING & IMPLICIT SKILLS: Look for direct technical skills (e.g., "C++"). Also infer requested implicit skills: e.g. "ออกแบบ ui" (UI design) means look for UI/UX, Figma, Design skills. Each matching skill adds strongly to the score.

4. SPECIAL TRAITS AS TIE-BREAKERS: If the requirement mentions soft skills or traits like "problem-solving" (แนวคิดการแก้ปัญหา), "leadership", prioritize candidates who explicitly list these in their skills or summary.

5. EXACT SCORING FORMULA REQUIREMENTS:
   - Role Match: 30% weight (If role completely mismatches, candidate should fall out of top 5 unless no one else fits)
   - Education Match: 25% weight  
   - Skills (Tech & Soft) Match: 35% weight
   - Experience: 10% weight

6. Return ONLY the Top 5 best matching candidates in the "rankedCandidates" array.
7. Even if scores are low, ALWAYS return at least 5 candidates.
8. Sort the final array by score in descending order.

Respond STRICTLY with valid JSON in the following format, with no markdown code blocks:

{
  "rankedCandidates": [
    {
      "id": "CAND-001",
      "name": "John Doe",
      "currentRole": "Software Engineer",
      "yearsOfExperience": 5,
      "education": "Master's Degree",
      "score": 95,
      "matchedSkills": ["React", "Node.js"],
      "missingSkills": ["AWS"],
      "pros": ["Holds Master's Degree as required", "Strong problem-solving background"],
      "cons": ["Lacks cloud infrastructure experience"]
    }
  ]
}
`;

    const requestBody = {
        model: 'typhoon-v2.5-30b-a3b-instruct',
        messages: [{ role: 'user', content: matchPrompt }],
        max_tokens: 16384,
        temperature: 0.3,
    };

    console.log('[ANALYZE] Sending to Typhoon API...', { model: requestBody.model, apiKeyPrefix: API_KEY?.substring(0, 10) + '...' });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('[ANALYZE] Typhoon API Status:', response.status);
        console.error('[ANALYZE] Typhoon API Response:', err);
        return res.status(response.status).json({ error: 'Failed to communicate with OpenTyphoon AI', details: err });
    }

    const data = await response.json();
    let textObj = data.choices[0].message.content;

    // strip markdown wrappers if AI adds them
    textObj = textObj.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
    
    const parsedData = JSON.parse(textObj);
    return res.json(parsedData);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Error analyzing candidates via AI' });
  }
});

router.post('/extract', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Resume text is required for extraction' });
    }

    const extractPrompt = `
You are an expert HR AI Data Extractor. Extract the candidate's profile from the following resume text.
Output strictly as JSON in this format:

{
  "name": "Full Name",
  "currentRole": "Most relevant job title according to the resume",
  "yearsOfExperience": <Total years as integer>,
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "education": "Highest degree obtained",
  "summary": "A short 1-2 sentence professional summary"
}

Resume Text:
"""
${text}
"""
`;

    const requestBody = {
        model: 'typhoon-v2.5-30b-a3b-instruct',
        messages: [{ role: 'user', content: extractPrompt }],
        max_tokens: 1500,
        temperature: 0.1,
    };

    console.log('[EXTRACT] Sending to Typhoon API...', { model: requestBody.model, textLength: text.length });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('[EXTRACT] Typhoon API Status:', response.status);
        console.error('[EXTRACT] Typhoon API Response:', err);
        return res.status(response.status).json({ error: 'Failed to extract resume data via OpenTyphoon AI', details: err });
    }

    const data = await response.json();
    let textObj = data.choices[0].message.content;

    textObj = textObj.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();

    const parsedData = JSON.parse(textObj);
    return res.json(parsedData);
  } catch (error) {
    console.error('AI Extraction Error:', error);
    return res.status(500).json({ error: 'Server error extracting resume data' });
  }
});

export default router;
