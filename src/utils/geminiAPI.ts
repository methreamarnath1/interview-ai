import { getApiKey } from "./localStorage";

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  error?: {
    message: string;
    code?: number;
  };
}

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface CodingProblem {
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
  complexity: string;
}

interface CodeEvaluation {
  score: number;
  correctness: string;
  performance: string;
  style: string;
  improvements: string[];
}

interface InterviewFeedback {
  overall: string;
  mcq: string;
  coding: string;
  systemDesign: string;
  hr: string;
  scores: {
    mcq: number;
    coding: number;
    systemDesign: number;
    hr: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// Function to generate MCQ questions based on job role
export async function generateMCQQuestions(
  jobTitle: string, 
  company: string, 
  experience: string,
  jobDescription: string = ""
): Promise<MCQQuestion[]> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  const prompt = `
    Generate 10 multiple-choice questions for a ${jobTitle} interview at ${company}.
    The candidate has ${experience} experience level.
    ${jobDescription ? `The job description is: ${jobDescription}` : ''}
    
    Make these questions realistic and challenging, similar to what would be asked in a real interview for this role.
    Adapt the questions to the role type:
    - For technical roles (software, engineering, design, finance): Include technical knowledge questions
    - For business roles (marketing, sales, consulting): Include case-study and strategy questions
    - For management roles: Include leadership and people management questions
    - For healthcare/scientific roles: Include domain-specific knowledge questions
    
    Format each question as a JSON object with:
    1. "id": A unique number for the question
    2. "question": The question text
    3. "options": Array of 4 possible answers
    4. "correctAnswer": Index of the correct option (0-3)
    
    Return ONLY a valid JSON array with no additional text or comments.
  `;
  
  try {
    // Updated API URL to use the correct version and model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to generate MCQ questions");
    }
    
    // Parse the response text as JSON
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean up response - remove markdown code blocks if present
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating MCQ questions:", error);
    throw error;
  }
}

// Function to generate a coding problem or case study based on job role
export async function generateCodingProblem(
  jobTitle: string, 
  company: string,
  experience: string,
  jobDescription: string = ""
): Promise<CodingProblem> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  const isTechnicalRole = jobTitle.toLowerCase().includes("developer") || 
                          jobTitle.toLowerCase().includes("engineer") || 
                          jobTitle.toLowerCase().includes("programmer") || 
                          jobTitle.toLowerCase().includes("software") || 
                          jobTitle.toLowerCase().includes("data") || 
                          jobTitle.toLowerCase().includes("coding");
  
  const prompt = isTechnicalRole ? 
    `
    Generate a realistic coding problem that might be asked in a ${jobTitle} interview at ${company}.
    The candidate has ${experience} experience level.
    ${jobDescription ? `The job description is: ${jobDescription}` : ''}
    
    Research the types of questions that ${company} typically asks for ${jobTitle} positions.
    Make it challenging but appropriate for the experience level.
    Choose from popular problems from platforms like LeetCode, CodeForces, or those commonly asked in ${company} interviews.
    ` :
    `
    Generate a realistic case study or problem-solving challenge for a ${jobTitle} interview at ${company}.
    The candidate has ${experience} experience level.
    ${jobDescription ? `The job description is: ${jobDescription}` : ''}
    
    Research the types of case studies or business problems that ${company} typically asks for ${jobTitle} positions.
    Make it challenging but appropriate for the experience level and relevant to the industry.
    `;
    
  const promptEnd = `
    Return the problem statement with:
    1. Clear description
    2. Input/output examples or expected deliverables
    3. Constraints or requirements
    4. Expected approach or complexity (if applicable)
    
    Format as JSON:
    {
      "title": "Problem title",
      "description": "Detailed problem description",
      "examples": ["Example 1 with input/output", "Example 2 with input/output"],
      "constraints": ["Constraint 1", "Constraint 2"],
      "complexity": "Expected time/space complexity or approach"
    }
  `;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt + promptEnd,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to generate problem");
    }
    
    // Clean up response and parse JSON
    const responseText = data.candidates[0].content.parts[0].text;
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating problem:", error);
    throw error;
  }
}

// Function to generate system design or strategy question
export async function generateSystemDesignQuestion(
  jobTitle: string,
  experience: string,
  jobDescription: string = ""
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  const isTechnicalRole = jobTitle.toLowerCase().includes("developer") || 
                          jobTitle.toLowerCase().includes("engineer") || 
                          jobTitle.toLowerCase().includes("software") || 
                          jobTitle.toLowerCase().includes("architect");
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: isTechnicalRole ?
                  `
                    Generate a challenging system design question appropriate for a ${jobTitle} with ${experience} experience.
                    ${jobDescription ? `Based on this job description: ${jobDescription}` : ''}
                    The question should test their knowledge of scalability, reliability, and architectural patterns.
                    Make it realistic and similar to what would be asked in a real interview.
                    
                    Return only the question text without any additional formatting or explanations.
                  ` :
                  `
                    Generate a challenging strategic or planning question appropriate for a ${jobTitle} with ${experience} experience.
                    ${jobDescription ? `Based on this job description: ${jobDescription}` : ''}
                    The question should test their knowledge of ${jobTitle.toLowerCase().includes("marketing") ? "marketing strategies, campaign planning, and ROI analysis" : 
                                                          jobTitle.toLowerCase().includes("sales") ? "sales strategies, territory planning, and pipeline management" :
                                                          jobTitle.toLowerCase().includes("hr") ? "talent acquisition, employee development, and organizational design" :
                                                          jobTitle.toLowerCase().includes("finance") ? "financial planning, risk management, and investment strategy" :
                                                          "strategic planning, resource allocation, and organizational effectiveness"}.
                    Make it realistic and similar to what would be asked in a real interview.
                    
                    Return only the question text without any additional formatting or explanations.
                  `,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to generate system design question");
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating system design question:", error);
    throw error;
  }
}

// Function to generate HR questions
export async function generateHRQuestions(
  jobTitle: string,
  company: string,
  experience: string
): Promise<string[]> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  const prompt = `
    Generate 10 realistic HR interview questions for a ${jobTitle} position at ${company}.
    The candidate has ${experience} experience level.
    
    Include a mix of:
    - Behavioral questions
    - Cultural fit questions
    - Career goal questions
    - Situational questions relevant to the ${jobTitle} role
    
    The questions should be challenging but fair, similar to what would be asked in a real HR interview round.
    Return ONLY an array of question strings in JSON format without any additional text.
  `;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to generate HR questions");
    }
    
    // Parse the response text as JSON
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean up response - remove markdown code blocks if present
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating HR questions:", error);
    throw error;
  }
}

// Function to evaluate code solution
export async function evaluateCodeSolution(
  problem: string, 
  solution: string,
  language: string
): Promise<CodeEvaluation> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  const prompt = `
    Evaluate this ${language} solution to the following coding problem:
    
    PROBLEM:
    ${problem}
    
    SOLUTION:
    ${solution}
    
    Provide detailed technical feedback on:
    1. Correctness - Does it solve the problem correctly?
    2. Time complexity - What is the Big O notation?
    3. Space complexity - How efficient is the memory usage?
    4. Code style and best practices - Is the code well-structured and readable?
    5. Edge cases handling - Does it handle all possible inputs properly?
    
    Return your evaluation as JSON:
    {
      "score": 0-100,
      "correctness": "feedback on correctness",
      "performance": "feedback on time/space complexity",
      "style": "feedback on code style",
      "improvements": ["suggestion 1", "suggestion 2", "suggestion 3"]
    }
  `;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to evaluate code solution");
    }
    
    // Clean up response and parse JSON
    const responseText = data.candidates[0].content.parts[0].text;
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error evaluating code solution:", error);
    throw error;
  }
}

// Function to evaluate system design answer
export async function evaluateSystemDesignAnswer(
  question: string,
  answer: string
): Promise<{ score: number; feedback: string }> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  const prompt = `
    Evaluate this system design answer:
    
    QUESTION:
    ${question}
    
    ANSWER:
    ${answer}
    
    Provide detailed feedback on:
    1. Architecture choices
    2. Scalability considerations
    3. Data storage decisions
    4. Availability and reliability
    5. Performance optimizations
    
    Return your evaluation as JSON:
    {
      "score": 0-100,
      "feedback": "detailed feedback including strengths and areas for improvement"
    }
  `;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to evaluate system design answer");
    }
    
    // Clean up response and parse JSON
    const responseText = data.candidates[0].content.parts[0].text;
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error evaluating system design answer:", error);
    throw error;
  }
}

// Function to generate interview feedback
export async function generateInterviewFeedback(
  jobTitle: string,
  experience: string,
  mcqAnswers: number[],
  correctMcqAnswers: number[],
  codingProblem: string,
  codingSolution: string,
  systemDesignQuestion: string,
  systemDesignAnswer: string,
  hrAnswers: Record<string, string>
): Promise<InterviewFeedback> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found");
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
    Generate comprehensive feedback for a ${jobTitle} interview with ${experience} experience level.
    
    MCQ PERFORMANCE:
    - Got ${mcqAnswers.filter((ans, i) => ans === correctMcqAnswers[i]).length} out of ${mcqAnswers.length} correct
    
    CODING CHALLENGE:
    Problem: ${codingProblem}
    Solution: ${codingSolution}
    
    SYSTEM DESIGN:
    Question: ${systemDesignQuestion}
    Answer: ${systemDesignAnswer}
    
    HR QUESTIONS & ANSWERS:
    ${Object.entries(hrAnswers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')}
    
    Provide detailed feedback on all aspects of the interview and assign scores.
    Return your evaluation as JSON:
    {
      "overall": "overall feedback summary",
      "mcq": "feedback on MCQ performance",
      "coding": "feedback on coding solution",
      "systemDesign": "feedback on system design answer",
      "hr": "feedback on HR responses",
      "scores": {
        "mcq": 0-100,
        "coding": 0-100,
        "systemDesign": 0-100,
        "hr": 0-100,
        "overall": 0-100
      },
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
    }
  `,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 8192,
          },
        }),
      }
    );
    
    const data: GeminiResponse = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error?.message || "Failed to generate interview feedback");
    }
    
    // Clean up response and parse JSON
    const responseText = data.candidates[0].content.parts[0].text;
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating interview feedback:", error);
    throw error;
  }
}
