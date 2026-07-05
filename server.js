import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load mock data based on input skills
async function getFallbackData(skills = []) {
  try {
    const skillsLower = skills.map(s => s.toLowerCase());
    
    // Choose appropriate fallback mock file
    let mockFile = 'sample3.json'; // Business/Product fallback
    if (skillsLower.some(s => s.includes('python') || s.includes('sql') || s.includes('data') || s === 'ml' || s === 'ai' || s.includes('machine') || s.includes('excel') || s.includes('analyst'))) {
      mockFile = 'sample1.json'; // Data & AI fallback
    } else if (skillsLower.some(s => s.includes('html') || s.includes('css') || s.includes('js') || s.includes('javascript') || s.includes('design') || s.includes('figma') || s.includes('react') || s.includes('web') || s.includes('frontend'))) {
      mockFile = 'sample2.json'; // Frontend & Design fallback
    }

    const filePath = path.join(__dirname, 'data', mockFile);
    console.log(`[Fallback] Loading mock file: ${filePath}`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fallback mock files:', error);
    // Hardcoded safety net in case mock files are missing
    return {
      matches: [
        {
          title: "Frontend Developer",
          matchPercent: 90,
          reasoning: "Solid match based on interest in user interfaces.",
          skillsYouHave: skills.slice(0, 3),
          skillsToLearn: ["React", "TailwindCSS", "Git"],
          salaryRange: { min: 400000, max: 1000000, currency: "INR", period: "annual" },
          demandOutlook: "High",
          confidenceScore: 85,
          roadmap: [
            { month: 1, focus: "HTML/CSS & JavaScript", tasks: ["Learn CSS layouts", "Practice DOM manipulation"] },
            { month: 2, focus: "React Basics", tasks: ["Learn components", "Build simple apps"] }
          ]
        }
      ]
    };
  }
}

// Endpoint: AI-driven Career Analysis
app.post('/api/analyze', async (req, res) => {
  const { skills, experienceLevel, preferences, additionalContext } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  console.log(`[API /api/analyze] Received request. Skills: ${skills?.join(', ')}, Level: ${experienceLevel}`);

  if (!apiKey) {
    console.log('[API /api/analyze] GEMINI_API_KEY not found in env. Falling back to mock data.');
    const fallback = await getFallbackData(skills);
    return res.json(fallback);
  }

  // Define response schema for Gemini API
  const responseSchema = {
    type: "OBJECT",
    properties: {
      matches: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            matchPercent: { type: "INTEGER" },
            reasoning: { type: "STRING" },
            skillsYouHave: { type: "ARRAY", items: { type: "STRING" } },
            skillsToLearn: { type: "ARRAY", items: { type: "STRING" } },
            salaryRange: {
              type: "OBJECT",
              properties: {
                min: { type: "INTEGER" },
                max: { type: "INTEGER" },
                currency: { type: "STRING" },
                period: { type: "STRING" }
              },
              required: ["min", "max", "currency", "period"]
            },
            demandOutlook: { type: "STRING", description: "High | Medium | Low" },
            confidenceScore: { type: "INTEGER" },
            roadmap: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  month: { type: "INTEGER" },
                  focus: { type: "STRING" },
                  tasks: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["month", "focus", "tasks"]
              }
            }
          },
          required: ["title", "matchPercent", "reasoning", "skillsYouHave", "skillsToLearn", "salaryRange", "demandOutlook", "confidenceScore", "roadmap"]
        }
      }
    },
    required: ["matches"]
  };

  const systemInstruction = 
    "You are an expert career counselor and technical coach with deep knowledge of Indian and global job markets. " +
    "Analyze the user's skills, experience level, and preferences, and return exactly 3 to 4 personalized, realistic career path matches. " +
    "You must return a valid JSON object matching the requested schema. " +
    "Ensure salary ranges are realistic for Indian market conditions (in INR annual) and roadmaps span 3 to 6 months with clear, actionable monthly tasks.";

  const prompt = `
    User Input:
    - Current Skills: ${JSON.stringify(skills)}
    - Experience Level: ${experienceLevel}
    - Preferences: ${JSON.stringify(preferences)}
    - Additional context: "${additionalContext || 'None'}"
    
    Please compute matching percentage (out of 100), reasoning, current matched skills vs skills to learn, salary ranges in INR, demand status, and a detailed monthly roadmap.
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds abort timeout

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const resultJson = await response.json();
    const candidates = resultJson.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidate content returned from Gemini.');
    }

    const textResponse = candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(textResponse);
    
    return res.json(parsedData);
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[API /api/analyze] Error calling Gemini API or parsing response:', err.message);
    console.log('[API /api/analyze] Serving fallback mock data instead.');
    
    const fallback = await getFallbackData(skills);
    return res.json(fallback);
  }
});

// Endpoint: Ask AI Coach (Followup chat)
app.post('/api/followup', async (req, res) => {
  const { question, chatHistory, selectedPath } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  console.log(`[API /api/followup] Received follow-up question for: ${selectedPath?.title}`);

  if (!apiKey) {
    console.log('[API /api/followup] GEMINI_API_KEY not found in env. Returning simple mock response.');
    return res.json({
      answer: `Thanks for asking about **${selectedPath?.title || 'this path'}**! Since we are running in offline/demo mode, here is a helpful guideline:\n\n*   **Recommended Action:** Focus on mastering ${selectedPath?.skillsToLearn?.slice(0, 2).join(' and ') || 'the recommended missing skills'}.\n*   **Growth Potential:** The demand is strong, especially in high-growth companies.\n*   **Next step:** Begin executing Month 1 of your personalized roadmap!\n\n*(Connect your Gemini API Key in the \`.env\` file to unlock fully dynamic, live responses to any career-related question!)*`
    });
  }

  // Construct a prompt with context and history
  let conversationHistoryString = '';
  if (chatHistory && chatHistory.length > 0) {
    conversationHistoryString = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'AI Assistant'}: ${msg.text}`).join('\n');
  }

  const prompt = `
    Context: The user is reviewing recommendations for the career path "${selectedPath?.title}".
    Path details: ${JSON.stringify(selectedPath)}

    Prior Conversation:
    ${conversationHistoryString}

    User's New Question:
    "${question}"

    Please answer the user's question as a professional, encouraging career coach. 
    Keep your answer focused, highly actionable, and formatted in Markdown. 
    Keep the length concise (150-200 words) and address constraints directly.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: "You are a professional, helpful career counselor. Speak in first person, be encouraging and direct, and structure your responses with markdown." }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const resultJson = await response.json();
    const answer = resultJson.candidates[0].content.parts[0].text;
    return res.json({ answer });
  } catch (err) {
    console.error('[API /api/followup] Error in follow-up API:', err);
    return res.status(500).json({
      answer: "I'm having trouble connecting to the AI helper right now. Try practicing your core technical skills in the meantime!"
    });
  }
});

// Serve frontend static files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
