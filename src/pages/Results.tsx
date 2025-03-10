
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { getInterviewSetup, getInterviewResults, getMCQAnswers, getCodingSubmission, getSystemDesignAnswer, getHRAnswers, saveInterviewResults } from "@/utils/localStorage";
import { generateInterviewFeedback } from "@/utils/geminiAPI";

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

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user has completed all rounds
    const setup = getInterviewSetup();
    if (!setup) {
      toast.error("Interview data not found");
      navigate("/");
      return;
    }

    const loadResults = async () => {
      try {
        // First check if we already have generated results
        const savedResults = getInterviewResults();
        if (savedResults) {
          setFeedback(savedResults);
          setLoading(false);
          return;
        }
        
        // Get all the user's answers from different rounds
        const mcqAnswers = getMCQAnswers();
        const codingSolution = getCodingSubmission();
        const systemDesignAnswer = getSystemDesignAnswer();
        const hrAnswers = getHRAnswers();
        
        if (!mcqAnswers || !codingSolution || !systemDesignAnswer || !hrAnswers) {
          toast.error("Missing data from one or more interview rounds");
          navigate("/setup");
          return;
        }
        
        // For the demo, we'll use mock correct answers
        const correctMcqAnswers = Array(mcqAnswers.length).fill(0).map((_, i) => i % 4);
        
        // Generate feedback using Gemini API
        const result = await generateInterviewFeedback(
          setup.jobTitle,
          setup.experience,
          mcqAnswers,
          correctMcqAnswers,
          "Implement a function to find missing number in an array",
          codingSolution,
          "Design a scalable system for an e-commerce platform",
          systemDesignAnswer,
          hrAnswers
        );
        
        if (result) {
          setFeedback(result);
          saveInterviewResults(result);
        } else {
          // Fallback to mock results if API fails
          setFeedback(getFallbackResults());
        }
      } catch (error) {
        console.error("Failed to generate interview results:", error);
        toast.error("Failed to analyze interview performance");
        setFeedback(getFallbackResults());
      } finally {
        setLoading(false);
      }
    };
    
    loadResults();
  }, [navigate]);

  // Fallback mock feedback
  const getFallbackResults = (): InterviewFeedback => {
    return {
      overall: "Your performance was strong across all interview rounds. You demonstrated solid technical knowledge and problem-solving abilities.",
      mcq: "You answered 7/10 MCQ questions correctly. Your understanding of core concepts is good, but consider reviewing asynchronous JavaScript concepts.",
      coding: "Your solution was efficient and well-structured. The time complexity analysis was spot on. Consider adding more comments to improve readability.",
      systemDesign: "Your system design demonstrated good understanding of scalability concerns. The database schema was well thought out, but the caching strategy could be improved.",
      hr: "Your responses to HR questions were authentic and reflected good communication skills. For behavioral questions, try using the STAR method more consistently.",
      scores: {
        mcq: 70,
        coding: 85,
        systemDesign: 78,
        hr: 90,
        overall: 81
      },
      strengths: [
        "Strong problem-solving skills",
        "Good communication and articulation",
        "Solid understanding of core technical concepts"
      ],
      weaknesses: [
        "Some gaps in advanced technical knowledge",
        "Caching strategies in system design could be improved",
        "Code documentation could be more thorough"
      ],
      recommendations: [
        "Review asynchronous JavaScript concepts",
        "Practice more system design problems with focus on scalability",
        "Improve code documentation habits"
      ]
    };
  };

  const handleDownloadReport = () => {
    if (!feedback) return;
    
    // Create a PDF-like text report
    const reportContent = `
    INTERVIEW PERFORMANCE REPORT
    ===========================
    
    OVERALL EVALUATION
    -----------------
    ${feedback.overall}
    
    Overall Score: ${feedback.scores.overall}%
    
    ROUND EVALUATIONS
    ----------------
    MCQ Round (${feedback.scores.mcq}%):
    ${feedback.mcq}
    
    Coding Round (${feedback.scores.coding}%):
    ${feedback.coding}
    
    System Design Round (${feedback.scores.systemDesign}%):
    ${feedback.systemDesign}
    
    HR Round (${feedback.scores.hr}%):
    ${feedback.hr}
    
    STRENGTHS
    --------
    ${feedback.strengths.map((s, i) => `${i+1}. ${s}`).join('\n')}
    
    AREAS FOR IMPROVEMENT
    -------------------
    ${feedback.weaknesses.map((w, i) => `${i+1}. ${w}`).join('\n')}
    
    RECOMMENDATIONS
    -------------
    ${feedback.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}
    `;
    
    // Create a blob and download link
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 p-4 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="glass dark:glass-dark p-8 rounded-2xl flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-medium dark:text-white">Analyzing your interview performance...</h2>
            <p className="text-apple-gray-600 dark:text-gray-400 mt-2">This may take a few moments</p>
          </div>
        ) : feedback ? (
          <div className="glass dark:glass-dark p-8 rounded-2xl">
            <h1 className="text-2xl font-semibold mb-6 dark:text-white">Interview Results</h1>
            
            <div className="mb-8">
              <div className="p-4 bg-apple-blue/10 dark:bg-blue-900/30 rounded-lg border border-apple-blue/30 dark:border-blue-700/50 mb-6">
                <h2 className="text-xl font-medium mb-2 dark:text-white">Overall Score: {feedback.scores.overall}%</h2>
                <p className="dark:text-gray-300">{feedback.overall}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MCQ Results */}
                <div className="p-4 border border-apple-gray-300 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium dark:text-white">MCQ Round</h3>
                    <span className="text-lg font-semibold text-apple-blue dark:text-blue-400">{feedback.scores.mcq}%</span>
                  </div>
                  <div className="w-full h-2 bg-apple-gray-200 dark:bg-gray-700 rounded-full mb-3">
                    <div 
                      className="h-full bg-apple-blue dark:bg-blue-600 rounded-full"
                      style={{ width: `${feedback.scores.mcq}%` }}
                    />
                  </div>
                  <p className="text-sm text-apple-gray-600 dark:text-gray-400">{feedback.mcq}</p>
                </div>
                
                {/* Coding Results */}
                <div className="p-4 border border-apple-gray-300 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium dark:text-white">Coding Round</h3>
                    <span className="text-lg font-semibold text-apple-blue dark:text-blue-400">{feedback.scores.coding}%</span>
                  </div>
                  <div className="w-full h-2 bg-apple-gray-200 dark:bg-gray-700 rounded-full mb-3">
                    <div 
                      className="h-full bg-apple-blue dark:bg-blue-600 rounded-full"
                      style={{ width: `${feedback.scores.coding}%` }}
                    />
                  </div>
                  <p className="text-sm text-apple-gray-600 dark:text-gray-400">{feedback.coding}</p>
                </div>
                
                {/* System Design Results */}
                <div className="p-4 border border-apple-gray-300 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium dark:text-white">System Design Round</h3>
                    <span className="text-lg font-semibold text-apple-blue dark:text-blue-400">{feedback.scores.systemDesign}%</span>
                  </div>
                  <div className="w-full h-2 bg-apple-gray-200 dark:bg-gray-700 rounded-full mb-3">
                    <div 
                      className="h-full bg-apple-blue dark:bg-blue-600 rounded-full"
                      style={{ width: `${feedback.scores.systemDesign}%` }}
                    />
                  </div>
                  <p className="text-sm text-apple-gray-600 dark:text-gray-400">{feedback.systemDesign}</p>
                </div>
                
                {/* HR Results */}
                <div className="p-4 border border-apple-gray-300 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium dark:text-white">HR Round</h3>
                    <span className="text-lg font-semibold text-apple-blue dark:text-blue-400">{feedback.scores.hr}%</span>
                  </div>
                  <div className="w-full h-2 bg-apple-gray-200 dark:bg-gray-700 rounded-full mb-3">
                    <div 
                      className="h-full bg-apple-blue dark:bg-blue-600 rounded-full"
                      style={{ width: `${feedback.scores.hr}%` }}
                    />
                  </div>
                  <p className="text-sm text-apple-gray-600 dark:text-gray-400">{feedback.hr}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strengths */}
              <div className="p-4 border border-green-300 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="font-medium mb-3 text-green-800 dark:text-green-400">Strengths</h3>
                <ul className="list-disc pl-5 space-y-1 text-green-700 dark:text-green-300">
                  {feedback.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              
              {/* Weaknesses */}
              <div className="p-4 border border-amber-300 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <h3 className="font-medium mb-3 text-amber-800 dark:text-amber-400">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-300">
                  {feedback.weaknesses.map((weakness, i) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>
              
              {/* Recommendations */}
              <div className="p-4 border border-blue-300 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-medium mb-3 text-blue-800 dark:text-blue-400">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300">
                  {feedback.recommendations.map((recommendation, i) => (
                    <li key={i}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
              >
                Start New Interview
              </Button>
              <Button onClick={handleDownloadReport}>
                Download Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass dark:glass-dark p-8 rounded-2xl text-center">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Unable to Generate Results</h2>
            <p className="text-apple-gray-700 dark:text-gray-300 mb-6">
              There was a problem analyzing your interview data. Please try again or start a new interview.
            </p>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
