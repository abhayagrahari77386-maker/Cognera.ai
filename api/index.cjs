const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('OPENROUTER_API_KEY loaded:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 10)}...` : 'MISSING');

const app = express();
app.use(cors());
app.use(express.json());

const QUESTION_DIMENSIONS = [
  { key: 'subjects', prompt: "You mentioned \"{lastAnswer}\". Which school/college subjects do you naturally enjoy the most, and why?" },
  { key: 'workStyle', prompt: "From your last answer \"{lastAnswer}\", do you prefer practical field work, desk work, or a mix? Explain with one example." },
  { key: 'peopleVsSystems', prompt: "Based on what you shared, do you enjoy helping people directly more, or solving system/technical problems more?" },
  { key: 'riskStability', prompt: "Considering your response, do you prefer stable government-type roles or higher-risk private/startup roles?" },
  { key: 'leadership', prompt: "In group situations, do you like leading decisions or supporting execution? Share a recent example." },
  { key: 'creativity', prompt: "From your interests so far, how much do creativity and communication matter in your ideal career?" },
  { key: 'analysis', prompt: "Do you enjoy analytical tasks like numbers, logic, and data, or more expressive tasks like writing/design?" },
  { key: 'environment', prompt: "What kind of work environment suits you best: office, lab, field, classroom, hospital, or remote?" },
  { key: 'motivation', prompt: "Which matters more to you right now: social impact, salary growth, authority, innovation, or job security?" },
  { key: 'constraints', prompt: "Any personal constraints (location, finances, family expectations) that should influence your career path choice?" },
];

const CAREER_CLUSTERS = [
  'Engineering / Technology',
  'Medical / Healthcare',
  'Government / Civil Services / Defence / Police',
  'Commerce / Finance / Banking',
  'Business / Entrepreneurship',
  'Law / Policy',
  'Teaching / Education',
  'Design / Media / Arts',
  'Data / IT / Analytics',
  'Social Impact / Psychology / Counseling',
];

function normalizeQuestion(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAnswer(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fallbackUniqueQuestion(qaHistory) {
  const asked = new Set(
    qaHistory.map((item) => normalizeQuestion(item?.question))
  );
  const usedDimensionIndexes = new Set(qaHistory.map((_, idx) => idx));
  const lastAnswer = qaHistory.length
    ? String(qaHistory[qaHistory.length - 1]?.answer || 'your previous response')
    : 'your profile';

  for (let i = 0; i < QUESTION_DIMENSIONS.length; i += 1) {
    if (usedDimensionIndexes.has(i)) continue;
    const candidate = QUESTION_DIMENSIONS[i].prompt.replace('{lastAnswer}', lastAnswer);
    if (!asked.has(normalizeQuestion(candidate))) {
      return candidate;
    }
  }

  return `Thanks for sharing. Building on "${lastAnswer}", what specific daily tasks would make you feel excited and fulfilled in a career?`;
}

function pickNextDimension(qaHistory) {
  const used = new Set(
    qaHistory
      .map((item) => item?.dimensionKey)
      .filter(Boolean)
  );
  const next = QUESTION_DIMENSIONS.find((dimension) => !used.has(dimension.key));
  return next || QUESTION_DIMENSIONS[qaHistory.length % QUESTION_DIMENSIONS.length];
}

function fallbackLinkedQuestion(qaHistory) {
  const asked = new Set(qaHistory.map((item) => normalizeQuestion(item?.question)));
  const lastAnswer = qaHistory.length
    ? String(qaHistory[qaHistory.length - 1]?.answer || 'your previous response')
    : 'your profile';
  const nextDimension = pickNextDimension(qaHistory);
  const candidate = nextDimension.prompt.replace('{lastAnswer}', lastAnswer);
  if (!asked.has(normalizeQuestion(candidate))) {
    return {
      question: candidate,
      dimensionKey: nextDimension.key,
    };
  }

  return {
    question: fallbackUniqueQuestion(qaHistory),
    dimensionKey: 'followup',
  };
}

function hasEnoughSignal(qaHistory) {
  if (qaHistory.length < 8) return false;
  const uniqueAnswers = new Set(qaHistory.map((item) => normalizeAnswer(item?.answer)));
  return uniqueAnswers.size >= Math.max(5, Math.floor(qaHistory.length * 0.6));
}

function sanitizeComparedScores(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && isNonEmptyString(item.field))
    .map((item) => ({
      field: item.field,
      score: Number.isFinite(Number(item.score)) ? Math.max(0, Math.min(100, Number(item.score))) : 0,
      reason: isNonEmptyString(item.reason) ? item.reason : 'Scored from answer fit.',
    }));
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value, minLength = 1) {
  return Array.isArray(value) && value.length >= minLength && value.every(isNonEmptyString);
}

function parseJsonFromModelContent(content) {
  const rawText = String(content || '{}');
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
}

function normalizeSalaryRange(value, fallbackStart) {
  const raw = String(value || '').replace(/\u2013/g, '-');
  const numbers = raw.match(/\d+(\.\d+)?/g) || [];
  if (numbers.length >= 2) {
    return `${numbers[0]}-${numbers[1]} LPA`;
  }
  if (numbers.length === 1) {
    const low = Number(numbers[0]);
    const high = Math.max(low + 4, low * 1.8);
    return `${low}-${Math.round(high)} LPA`;
  }
  const low = Math.max(2, Number(fallbackStart || 4));
  return `${low}-${Math.round(low + 6)} LPA`;
}

function normalizeRoadmapPayload(payload, careerTitle) {
  const safeTitle = isNonEmptyString(payload?.title) ? payload.title.trim() : String(careerTitle || 'Career');
  const safeOverview = isNonEmptyString(payload?.overview)
    ? payload.overview.trim()
    : `${safeTitle} offers multiple growth paths in India with steady skill-based progression.`;
  const safeSteps = Array.isArray(payload?.steps)
    ? payload.steps
        .filter((step) => isNonEmptyString(step?.title) && isNonEmptyString(step?.details))
        .map((step, idx) => ({
          step: Number(step?.step || idx + 1),
          title: String(step.title).trim(),
          details: String(step.details).trim(),
        }))
    : [];
  const normalizedSteps = safeSteps.length
    ? safeSteps
    : [
        { step: 1, title: 'Build Foundation', details: `Learn fundamentals required for ${safeTitle}.` },
        { step: 2, title: 'Practice Projects', details: 'Create portfolio or practical experience with guided projects.' },
        { step: 3, title: 'Apply Strategically', details: 'Target internships, entry jobs, and mentorship for faster growth.' },
      ];

  const startIncome = Number(payload?.startingIncomeLPA);
  const normalizedStartIncome = Number.isFinite(startIncome) ? Math.max(2, Math.min(60, startIncome)) : 4;
  const normalizedSalaryRange = normalizeSalaryRange(payload?.salaryRange, normalizedStartIncome);
  const skills = isStringArray(payload?.skills, 1)
    ? payload.skills.map((item) => String(item).trim()).slice(0, 10)
    : ['Communication', 'Problem Solving', 'Domain Fundamentals'];
  const exams = isStringArray(payload?.exams, 1)
    ? payload.exams.map((item) => String(item).trim()).slice(0, 10)
    : ['Relevant entrance or aptitude exams (if applicable)'];
  const salaryEvidence = isStringArray(payload?.salaryEvidence, 1)
    ? payload.salaryEvidence.map((item) => String(item).trim()).slice(0, 8)
    : ['Estimated from recent India market trends and major job portals.'];

  return {
    title: safeTitle,
    overview: safeOverview,
    steps: normalizedSteps,
    skills,
    exams,
    startingIncomeLPA: normalizedStartIncome,
    salaryRange: normalizedSalaryRange,
    salaryEvidence,
  };
}

function validateRoadmapPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, reason: 'Roadmap payload is missing.' };
  }

  const hasValidSteps = Array.isArray(payload.steps)
    && payload.steps.length >= 3
    && payload.steps.every((step, index) =>
      Number(step?.step || index + 1) >= 1
      && isNonEmptyString(step?.title)
      && isNonEmptyString(step?.details)
    );

  const hasValidIncome = typeof payload.startingIncomeLPA === 'number'
    && Number.isFinite(payload.startingIncomeLPA)
    && payload.startingIncomeLPA >= 1
    && payload.startingIncomeLPA <= 60;

  const hasValidRange = isNonEmptyString(payload.salaryRange)
    && /\d+(\.\d+)?\s*[-to]+\s*\d+(\.\d+)?\s*LPA/i.test(payload.salaryRange.replace(/\u2013/g, '-'));

  const hasEvidence = isStringArray(payload.salaryEvidence, 1);

  const valid = isNonEmptyString(payload.title)
    && isNonEmptyString(payload.overview)
    && hasValidSteps
    && isStringArray(payload.skills, 3)
    && isStringArray(payload.exams, 1)
    && hasValidIncome
    && hasValidRange
    && hasEvidence;

  if (valid) return { valid: true };

  return {
    valid: false,
    reason: 'Roadmap validation failed. AI response had missing/unsafe fields.'
  };
}

app.get('/', (req, res) => {
  res.send('<h1>Cognera AI Backend is Running</h1><p>API endpoints are available at /api/predict, /api/chat, and /api/roadmap</p>');
});

const SYSTEM_PROMPT = `You are an expert AI career prediction engine for Indian students. 
 
 Your job is to analyze the student's complete answer history and predict the single best-fit career field in India with high clarity, strong reasoning, and minimum confusion. 
 
 IMPORTANT GOAL: 
 Do not default to engineering. 
 Do not over-prioritize technical careers. 
 Do not assume science stream is best. 
 You must compare the student against a broad range of Indian career fields before deciding. 
 
 You must reason using these dimensions: 
 - favorite subjects 
 - interest areas 
 - skills 
 - personality 
 - work style 
 - government vs private preference 
 - creative vs analytical tendency 
 - leadership vs support tendency 
 - indoor vs outdoor preference 
 - stability vs salary preference 
 - technical vs non-technical inclination 
 - people-oriented vs machine-oriented preference 
 
 You must compare the student's profile across all major Indian career clusters, including: 
 - Engineering / Technology 
 - Medical / Healthcare 
 - Government Services 
 - Civil Services (IAS, IPS, UPSC) 
 - Defence 
 - Banking / Finance / Insurance 
 - Commerce / Accounting / CA / CS / CMA 
 - Business / Entrepreneurship 
 - Law / Judiciary 
 - Teaching / Education 
 - Research / Scientist 
 - Design / Creative Arts / Animation 
 - Media / Journalism / Content 
 - Agriculture / Allied Sciences 
 - Hotel Management / Tourism 
 - Aviation 
 - Police / Paramilitary 
 - Skilled Trades / Vocational Careers 
 - Social Work / NGO / Public Policy 
 - Psychology / Counseling 
 - Sales / Marketing / Management 
 - Data / IT / Software 
 - Architecture / Planning 
 - Fashion / Fine Arts / Performing Arts 
 - Sports / Fitness 
 - Logistics / Operations / Supply Chain 
 
 DECISION RULES: 
 1. You must evaluate all major field clusters before making a decision. 
 2. Do not pick engineering unless the student's profile strongly supports it over all other fields. 
 3. If the student prefers stability, public service, leadership, authority, or social impact, compare government careers seriously. 
 4. If the student prefers helping people, biology, care, or service, compare medical and healthcare seriously. 
 5. If the student prefers business, money, trade, risk-taking, or independence, compare business and commerce seriously. 
 6. If the student prefers creativity, communication, visual thinking, or expression, compare design/media/arts seriously. 
 7. If the student prefers law, public order, argument, justice, policy, or administration, compare law/civil services/police seriously. 
 8. If the student prefers teaching, explanation, guidance, and academic patience, compare education seriously. 
 9. If the student prefers field work, discipline, patriotism, and physical challenge, compare defence/police seriously. 
 10. If the evidence is mixed, choose the strongest single recommendation and mention one backup only if truly needed. 
 11. Avoid giving too many options. 
 12. The first output priority is one best-fit field, not a list of many unrelated careers. 
 
 ANALYSIS METHOD: 
 - Infer traits from the student's answers. 
 - Detect consistency and contradictions. 
 - Identify the dominant pattern. 
 - Score major career clusters internally. 
 - Eliminate low-match fields. 
 - Select the highest-fit field. 
 - Explain the match simply and clearly. 
 
 ROADMAP RULES: 
 After predicting the best field, provide a practical roadmap: 
 - what to study next 
 - stream/degree/course options 
 - entrance exams required 
 - important skills to build 
 - certifications if useful 
 - job roles after entering the field 
 - where jobs are commonly available in India 
 - private sector / government / startups / remote / institutions / companies 
 - beginner-to-advanced path 
 - simple step-by-step plan 
 
 EXAM RULES: 
 Mention only relevant exams for the predicted field. 
 Do not overload with irrelevant exams. 
 If multiple pathways exist, separate them clearly. 
 
 OUTPUT STYLE: 
 - Clear 
 - Student-friendly 
 - India-focused 
 - Confident 
 - Not confusing 
 - Not too many suggestions 
 - Give one strong primary recommendation 
 - Give one backup only if necessary 
 
 RETURN ONLY VALID JSON IN THIS FORMAT: 
 
 { 
   "predictedField": "string", 
   "careerCluster": "string", 
   "confidence": 0, 
   "whyThisFieldFits": [ 
     "string", 
     "string", 
     "string" 
   ], 
   "topTraitsDetected": [ 
     "string", 
     "string", 
     "string" 
   ], 
   "rejectedFields": [ 
     { 
       "field": "string", 
       "reason": "string" 
     } 
   ], 
   "recommendedPathway": { 
     "after10th": ["string"], 
     "after12th": ["string"], 
     "degreeOptions": ["string"], 
     "alternativePaths": ["string"] 
   }, 
   "entranceExams": [ 
     { 
       "exam": "string", 
       "purpose": "string" 
     } 
   ], 
   "skillsToBuild": ["string", "string", "string"], 
   "jobRoles": ["string", "string", "string"], 
   "jobSectorsInIndia": ["string", "string", "string"], 
   "roadmap": [ 
     { 
       "step": 1, 
       "title": "string", 
       "details": "string" 
     }, 
     { 
       "step": 2, 
       "title": "string", 
       "details": "string" 
     } 
   ], 
   "backupField": { 
     "field": "string", 
     "reason": "string" 
   }, 
   "finalAdvice": "string" 
 }`;

app.post('/api/predict', async (req, res) => {
  console.log('Received /api/predict request');
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('API Key Missing in .env');
      return res.status(400).json({ 
        error: 'API Key Missing', 
        message: 'Please provide an OPENROUTER_API_KEY in the server/.env file' 
      });
    }

    const studentData = req.body;
    console.log('Student data:', JSON.stringify(studentData, null, 2));
    
    const interests = studentData.interests?.length > 0 ? studentData.interests.join(', ') : "None specified/Exploring";
    const skills = studentData.skills?.length > 0 ? studentData.skills.join(', ') : "None specified/Exploring";
    const goals = studentData.goals?.trim() || "Exploring opportunities/No specific goal yet";

    const aiQuestionAnswers = Array.isArray(studentData.aiQuestionAnswers)
      ? studentData.aiQuestionAnswers
          .filter((item) => item && item.question && item.answer)
          .map((item, index) => `${index + 1}. Q: ${item.question}\n   A: ${item.answer}`)
          .join('\n')
      : '';

    console.log('Calling OpenRouter API...');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Cognera AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          { 
            "role": "system", 
            "content": SYSTEM_PROMPT + "\n\nIMPORTANT: If the student provides very little information (e.g., no specific skills or goals), use their Education level as the primary anchor and predict a career that allows for exploration or provides a strong foundation for a beginner. Be encouraging." 
          },
          { 
            "role": "user", 
            "content": `Student Data:
            Name: ${studentData.fullName}
            Education: ${studentData.education}
            Interests: ${interests}
            Skills: ${skills}
            Career Goals: ${goals}
            Behaviour & Interest Question Answers:
            ${aiQuestionAnswers || "Not provided"}

            Based on the above student data (even if minimal), follow the system instructions and provide a career prediction.`
          }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter Predict Error Status:', response.status);
      console.error('OpenRouter Predict Error Details:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `OpenRouter API error (${response.status})`);
      } catch (e) {
        throw new Error(`OpenRouter API error (${response.status}): ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    console.log('OpenRouter Response received successfully');
    let text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      console.error('Empty response content from OpenRouter:', JSON.stringify(data, null, 2));
      throw new Error('AI returned an empty prediction');
    }
    
    // Extract JSON from the response text if it contains markdown formatting
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let prediction;
    try {
      prediction = JSON.parse(text);
      console.log('Prediction parsed successfully');
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', text);
      // Fallback object if parsing fails
      prediction = {
        predictedField: "Career Path (Processing...)",
        careerCluster: "General",
        confidence: 70,
        whyThisFieldFits: ["Based on your profile and interests.", "Matches your current education level.", "Offers strong growth opportunities."],
        topTraitsDetected: ["Determined", "Exploring", "Ambitious"],
        rejectedFields: [],
        recommendedPathway: {
          after10th: ["Focus on core subjects"],
          after12th: ["Pursue relevant undergraduate degree"],
          degreeOptions: ["Bachelors in relevant field"],
          alternativePaths: ["Vocational courses"]
        },
        entranceExams: [{ exam: "General Aptitude", purpose: "Admissions" }],
        skillsToBuild: ["Communication", "Problem Solving"],
        jobRoles: ["Professional"],
        jobSectorsInIndia: ["Private Sector"],
        roadmap: [{ step: 1, title: "Foundation", details: "Complete your current education with focus on relevant subjects." }],
        finalAdvice: "Continue exploring your interests while building core professional skills."
      };
    }
    res.json(prediction);
  } catch (error) {
    console.error('Error in /api/predict:', error);
    res.status(500).json({ error: 'Failed to generate career prediction', message: error.message });
  }
});

app.post('/api/assessment-questions', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(400).json({
        error: 'API Key Missing',
        message: 'Please provide an OPENROUTER_API_KEY in the server/.env file'
      });
    }

    const { fullName, education } = req.body || {};

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Cognera AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Create 6 short questions for a student career assessment to analyze behaviour, personality, work style, and genuine interests. Questions must be easy to understand for Indian students and each question should be answerable in 1-3 lines. Return ONLY JSON in shape: { \"questions\": [\"...\", \"...\"] }"
          },
          {
            role: "user",
            content: `Student Name: ${fullName || "Student"}\nEducation: ${education || "Not specified"}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter Questions Error Status:', response.status);
      console.error('OpenRouter Questions Error Details:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `OpenRouter API error (${response.status})`);
      } catch (e) {
        throw new Error(`OpenRouter API error (${response.status}): ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content || '{}';
    let parsed = {};
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(rawText);
    }

    const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 6) : [];
    if (!questions.length) {
      throw new Error('No questions generated');
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error in /api/assessment-questions:', error);
    res.status(500).json({
      error: 'Failed to generate assessment questions',
      message: error.message
    });
  }
});

app.post('/api/interview', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(400).json({ error: 'API Key Missing' });
    }

    const { fullName, education, qaHistory, sessionId } = req.body || {};
    const safeHistory = Array.isArray(qaHistory) ? qaHistory : [];
    const minQuestions = 8;
    const maxQuestions = 14;
    const currentDimension = pickNextDimension(safeHistory);
    const previousPredictions = safeHistory
      .map((item) => item?.predictedField)
      .filter(Boolean);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Cognera AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a career interviewer for Indian students.
Ask one short, clear question at a time to analyze behavior, personality, interests, work style, risk preference, strengths, people-orientation, analytical ability, creativity, leadership, and preference for stability/government/private.
Ask exactly ONE question per turn (never multiple at once).
The interview MUST continue until there is clear enough signal for prediction.
Minimum questions: ${minQuestions}
Maximum questions: ${maxQuestions}

You must compare the student's fit across these career clusters before final recommendation:
${CAREER_CLUSTERS.map((cluster) => `- ${cluster}`).join('\n')}

INPUT:
- Student profile and previous Q/A list.

RULES:
1) Ask exactly one follow-up question each turn.
2) Never repeat same or near-duplicate questions from qaHistory.
3) Every new question must logically connect to the previous answer and deepen analysis.
4) Do not get stuck in loops. If one theme is repeated, switch to an uncovered dimension.
5) Do not force the same career as default. Decide only from evidence.
6) If confidence is <78 or evidence is mixed, continue asking until max questions.
7) Stop only when confidence >=78 and at least ${minQuestions} answers exist, OR ${maxQuestions} reached.
8) Keep language simple and human like ChatGPT.
9) Final output must include compared field scores and short reasons for top and rejected fields.
10) Return ONLY JSON in this exact shape:
{
  "done": false,
  "question": "string",
  "progress": 1,
  "dimensionKey": "string",
  "needsMoreClarity": true,
  "prediction": null
}
OR
{
  "done": true,
  "question": null,
  "progress": ${maxQuestions},
  "dimensionKey": null,
  "needsMoreClarity": false,
  "prediction": {
    "predictedField": "string",
    "careerCluster": "string",
    "confidence": 0,
    "whyThisFieldFits": ["string", "string", "string"],
    "nextSteps": ["string", "string", "string"],
    "comparedFieldScores": [
      { "field": "string", "score": 0, "reason": "string" }
    ],
    "rejectedFields": [
      { "field": "string", "reason": "string" }
    ]
  }
}`
          },
          {
            role: "user",
            content: JSON.stringify({
              sessionId: sessionId || 'default-session',
              studentProfile: {
                fullName: fullName || "Student",
                education: education || "Not specified"
              },
              qaHistory: safeHistory,
              suggestedNextDimension: currentDimension.key,
              previousPredictions
            })
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter Interview Error Status:', response.status);
      console.error('OpenRouter Interview Error Details:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `OpenRouter API error (${response.status})`);
      } catch (e) {
        throw new Error(`OpenRouter API error (${response.status}): ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content || '{}';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    const askedQuestions = new Set(
      safeHistory.map((item) => normalizeQuestion(item?.question))
    );

    let question = parsed.question || null;
    let dimensionKey = isNonEmptyString(parsed.dimensionKey) ? parsed.dimensionKey : currentDimension.key;
    let done = Boolean(parsed.done);
    let prediction = parsed.prediction || null;
    const confidence = Number(prediction?.confidence || 0);
    const enoughSignal = hasEnoughSignal(safeHistory);
    const isDuplicateQuestion =
      !done &&
      question &&
      askedQuestions.has(normalizeQuestion(question));

    if (!done && (!question || isDuplicateQuestion)) {
      const fallback = fallbackLinkedQuestion(safeHistory);
      question = fallback.question;
      dimensionKey = fallback.dimensionKey;
    }

    if (!done && safeHistory.length >= maxQuestions) {
      done = true;
    }

    if (done && (safeHistory.length < minQuestions || (!enoughSignal && safeHistory.length < maxQuestions) || confidence < 78)) {
      done = false;
      const fallback = fallbackLinkedQuestion(safeHistory);
      question = fallback.question;
      dimensionKey = fallback.dimensionKey;
      prediction = null;
    }

    if (done && prediction) {
      prediction.comparedFieldScores = sanitizeComparedScores(prediction.comparedFieldScores);
      if (!prediction.comparedFieldScores.length) {
        prediction.comparedFieldScores = CAREER_CLUSTERS.slice(0, 5).map((field, index) => ({
          field,
          score: Math.max(40, 78 - index * 8),
          reason: 'Preliminary comparison from interview answers.',
        }));
      }
    }

    res.json({
      done,
      question,
      dimensionKey,
      needsMoreClarity: !done,
      progress: Number(parsed.progress || safeHistory.length),
      targetQuestions: maxQuestions,
      prediction
    });
  } catch (error) {
    console.error('Error in /api/interview:', error);
    res.status(500).json({ error: 'Failed to run interview', message: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  console.log('Received /api/chat request');
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('API Key Missing in .env');
      return res.status(400).json({ error: 'API Key Missing' });
    }

    const { messages } = req.body;
    console.log('Chat messages:', JSON.stringify(messages, null, 2));
    
    console.log('Calling OpenRouter API for chat...');
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Cognera AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "anthropic/claude-3-haiku",
        "max_tokens": 1000,
        "messages": [
          { "role": "system", "content": "You are Cognera AI Career Counselor. Help Indian students with career confusion, skills, and future paths. Be supportive, clear, and India-focused. Keep responses concise but helpful." },
          ...messages
        ]
      })
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter Chat Error Status:', response.status);
      console.error('OpenRouter Chat Error Details:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `OpenRouter API error (${response.status})`);
      } catch (e) {
        throw new Error(`OpenRouter API error (${response.status}): ${errorText.substring(0, 100)}`);
      }
    }

    const data = await response.json();
    console.log('OpenRouter Chat Response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure from OpenRouter:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response from AI');
    }
    
    res.json({ text: data.choices[0].message.content });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to chat', message: error.message });
  }
});

app.post('/api/roadmap', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(400).json({ error: 'API Key Missing' });
    }

    const { careerTitle } = req.body;
    if (!isNonEmptyString(careerTitle)) {
      return res.status(400).json({ error: 'Career title is required.' });
    }
    
    const requestPayload = {
      "model": "google/gemini-2.0-flash-001",
      "messages": [
        { 
          "role": "system", 
          "content": `Generate a detailed and trustworthy career roadmap for the given career in India.

CRITICAL SAFETY RULES:
- Do not provide fake, sensational, or guaranteed claims.
- Use realistic India-focused entry level salary values.
- Include beginner steps, skills, exams (if relevant), and salary evidence notes.
- If career is uncommon/new, still provide practical roadmap from publicly known market patterns.

Return ONLY JSON with this exact shape:
{
  "title": "string",
  "overview": "string",
  "steps": [{ "step": 1, "title": "string", "details": "string" }],
  "skills": ["string"],
  "exams": ["string"],
  "startingIncomeLPA": 0,
  "salaryRange": "x-y LPA",
  "salaryEvidence": ["string"]
}` 
        },
        { "role": "user", "content": `Career: ${careerTitle}` }
      ],
      "response_format": { "type": "json_object" }
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Cognera AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) throw new Error('OpenRouter API error');

    const data = await response.json();
    const parsedRoadmap = parseJsonFromModelContent(data?.choices?.[0]?.message?.content);
    let normalizedRoadmap = normalizeRoadmapPayload(parsedRoadmap, careerTitle);
    let validation = validateRoadmapPayload(normalizedRoadmap);

    if (!validation.valid) {
      const retryResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:8080",
          "X-Title": "Cognera AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "Fix this roadmap JSON to match required schema with realistic India salary values. Return only corrected JSON."
            },
            {
              role: "user",
              content: JSON.stringify({
                careerTitle,
                invalidRoadmap: parsedRoadmap
              })
            }
          ]
        })
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryParsed = parseJsonFromModelContent(retryData?.choices?.[0]?.message?.content);
        normalizedRoadmap = normalizeRoadmapPayload(retryParsed, careerTitle);
        validation = validateRoadmapPayload(normalizedRoadmap);
      }
    }

    if (!validation.valid) {
      return res.status(422).json({
        error: 'Roadmap validation failed',
        message: validation.reason,
        verified: false
      });
    }

    res.json({
      ...normalizedRoadmap,
      verified: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate roadmap', message: error.message });
  }
});

app.post('/api/skill-gap', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(400).json({ error: 'API Key Missing' });
    }

    const { cvText, targetCareer } = req.body;
    
    if (!isNonEmptyString(cvText)) {
      return res.status(400).json({ error: 'CV Text is required.' });
    }
    
    const isTargetProvided = isNonEmptyString(targetCareer);
    const targetInstruction = isTargetProvided 
      ? `the TARGET CAREER: ${targetCareer}` 
      : `a highly suitable TARGET CAREER that you must automatically determine based on their current CV strengths`;

    const requestPayload = {
      "model": "google/gemini-2.0-flash-001",
      "messages": [
        { 
          "role": "system", 
          "content": `You are an expert career and skills analyst. The user has provided the text extracted from their PDF CV.
          
YOUR TASK:
1. Analyze the user's CV to extract their CURRENT skills and experiences.
2. Compare their current skills against the standard industry requirements for ${targetInstruction}.
3. Identify the specific MISSING SKILLS (the "Skill Gap").
4. Provide a structured, step-by-step roadmap for how the user can learn and acquire those specific missing skills to successfully transition into the target career.

CRITICAL SAFETY RULES:
- Output strictly valid JSON.
- Do not make up skills the user has if they are not in the CV text.
- Roadmap steps must be practical and actionable in India.
${!isTargetProvided ? '- You MUST determine and output the best-fitting Target Career in the JSON.' : ''}

Return ONLY JSON with this exact shape:
{
  "targetCareer": "string",
  "estimatedTimePattern": "string (e.g. 3-6 months)",
  "estimatedSalary": "string (e.g. 8-12 LPA)",
  "currentSkills": ["string", "string"],
  "missingSkills": ["string", "string"],
  "roadmap": [
    { "step": 1, "title": "string", "details": "string" }
  ]
}` 
        },
        { "role": "user", "content": `${isTargetProvided ? `Target Career: ${targetCareer}\n\n` : ''}CV Text: ${cvText.substring(0, 15000)}` }
      ],
      "response_format": { "type": "json_object" }
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Cognera AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) throw new Error('OpenRouter API error');

    const data = await response.json();
    const parsedData = parseJsonFromModelContent(data?.choices?.[0]?.message?.content);

    res.json(parsedData);
  } catch (error) {
    console.error('Error in /api/skill-gap:', error);
    res.status(500).json({ error: 'Failed to analyze skill gap', message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

