
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { getInterviewSetup, saveHRAnswers, getHRAnswers, hasCompletedAllRounds } from "@/utils/localStorage";
import { generateHRQuestions } from "@/utils/geminiAPI";

const HR = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if all previous rounds are completed
    if (!hasCompletedAllRounds()) {
      toast.error("Please complete all previous rounds first");
      navigate("/setup");
      return;
    }

    const setup = getInterviewSetup();
    if (!setup) {
      toast.error("Interview setup not found");
      navigate("/setup");
      return;
    }

    const loadQuestions = async () => {
      try {
        // Generate HR questions using Gemini API
        const hrQuestions = await generateHRQuestions(
          setup.jobTitle,
          setup.company,
          setup.experience
        );
        
        setQuestions(hrQuestions);
        
        // Check for existing answers
        const savedAnswers = getHRAnswers();
        if (savedAnswers) {
          setAnswers(savedAnswers);
        } else {
          // Initialize empty answers
          const emptyAnswers: Record<string, string> = {};
          hrQuestions.forEach(q => {
            emptyAnswers[q] = "";
          });
          setAnswers(emptyAnswers);
        }
      } catch (error) {
        console.error("Failed to generate HR questions:", error);
        toast.error("Failed to generate HR questions. Using default questions instead.");
        
        // Fallback to basic questions if API fails
        const fallbackQuestions = [
          "Tell me about yourself and your background.",
          "Why are you interested in working for our company?",
          "Where do you see yourself in 5 years?",
          "What is your greatest professional achievement?",
          "How do you handle stressful situations or tight deadlines?",
          "Describe a situation where you had to lead a team through a difficult project.",
          "How have you handled disagreements with team members or managers?",
          "What projects have you worked on that you're most proud of?",
          "How do you stay updated with the latest technologies?",
          "What are you looking for in your next role?"
        ];
        
        setQuestions(fallbackQuestions);
        
        // Initialize empty answers for fallback questions
        const emptyAnswers: Record<string, string> = {};
        fallbackQuestions.forEach(q => {
          emptyAnswers[q] = "";
        });
        
        // Check for existing answers
        const savedAnswers = getHRAnswers();
        if (savedAnswers) {
          setAnswers(savedAnswers);
        } else {
          setAnswers(emptyAnswers);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [navigate]);

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
    
    // Auto-save as user types
    saveHRAnswers({
      ...answers,
      [question]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Check if any questions are unanswered
    const unansweredQuestions = questions.filter(q => !answers[q]?.trim());
    
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions before submitting (${unansweredQuestions.length} remaining)`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save all HR answers
      saveHRAnswers(answers);
      
      toast.success("HR interview completed");
      
      // Navigate to results page
      setTimeout(() => {
        navigate("/results");
      }, 1000);
    } catch (error) {
      toast.error("Failed to submit answers");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-apple-gray-700 dark:text-gray-300">Generating HR interview questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 p-4 py-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="glass dark:glass-dark p-8 rounded-2xl">
          <h1 className="text-2xl font-semibold mb-6 dark:text-white">HR Interview</h1>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-apple-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium dark:text-gray-300">
                {Object.values(answers).filter(a => a.trim()).length} of {questions.length} answered
              </span>
            </div>
            
            <div className="w-full h-2 bg-apple-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-apple-blue dark:bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-6 dark:text-white">
              {questions[currentQuestion]}
            </h2>
            
            <textarea
              value={answers[questions[currentQuestion]] || ""}
              onChange={(e) => handleAnswerChange(questions[currentQuestion], e.target.value)}
              placeholder="Your answer..."
              className="w-full h-64 p-4 bg-white dark:bg-gray-800 border border-apple-gray-300 dark:border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-apple-blue focus:border-transparent resize-none
                       text-apple-gray-800 dark:text-gray-200"
            />
          </div>
          
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous
            </Button>
            
            <div className="flex gap-3">
              {currentQuestion < questions.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Complete Interview"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HR;
