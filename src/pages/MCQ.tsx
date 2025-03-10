
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { getInterviewSetup, saveMCQAnswers, getMCQAnswers, getThemePreference } from "@/utils/localStorage";
import { generateMCQQuestions } from "@/utils/geminiAPI";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const MCQ = () => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiErrorOccurred, setApiErrorOccurred] = useState(false);
  const navigate = useNavigate();

  // Get interview setup data and load questions
  useEffect(() => {
    const setup = getInterviewSetup();
    if (!setup) {
      toast.error("Interview setup not found");
      navigate("/setup");
      return;
    }

    const fetchQuestions = async () => {
      try {
        // Try to load saved MCQ answers first
        const savedAnswers = getMCQAnswers();
        
        // Attempt to generate questions via Gemini API
        const generatedQuestions = await generateMCQQuestions(
          setup.jobTitle,
          setup.company,
          setup.experience
        );
        
        if (generatedQuestions && generatedQuestions.length > 0) {
          console.log("Successfully generated questions:", generatedQuestions);
          setQuestions(generatedQuestions);
          
          // Initialize selected answers array with saved answers or -1
          if (savedAnswers && savedAnswers.length === generatedQuestions.length) {
            setSelectedAnswers(savedAnswers);
          } else {
            setSelectedAnswers(Array(generatedQuestions.length).fill(-1));
          }
          setApiErrorOccurred(false);
        } else {
          // Fallback to mock questions if API fails
          console.warn("No questions returned, using fallback questions");
          loadMockQuestions();
          setApiErrorOccurred(true);
          toast.warning("Using sample questions as we couldn't generate custom ones");
        }
      } catch (error) {
        console.error("Error loading MCQ questions:", error);
        toast.error("Failed to load questions. Using sample questions instead.");
        loadMockQuestions();
        setApiErrorOccurred(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate]);

  // Fallback mock questions
  const loadMockQuestions = () => {
    const mockQuestions = [
      {
        id: 1,
        question: "What is the primary purpose of React's virtual DOM?",
        options: [
          "To speed up CSS animations",
          "To minimize direct manipulation of the real DOM for performance",
          "To enable server-side rendering",
          "To provide better SEO optimization"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "Which of the following is NOT a React Hook?",
        options: [
          "useState",
          "useEffect",
          "useDispatch",
          "useHistory"
        ],
        correctAnswer: 3
      },
      {
        id: 3,
        question: "What is the correct way to pass a prop called 'name' to a component?",
        options: [
          "<Component name='John' />",
          "<Component props.name='John' />",
          "<Component props={name: 'John'} />",
          "<Component {name='John'} />"
        ],
        correctAnswer: 0
      },
      {
        id: 4,
        question: "What does the useEffect Hook do in React?",
        options: [
          "It only runs once when the component mounts",
          "It allows you to perform side effects in function components",
          "It replaces the componentDidMount lifecycle method only",
          "It is used exclusively for API calls"
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        question: "What is the purpose of keys in React lists?",
        options: [
          "To style list items differently",
          "To help React identify which items have changed, are added, or removed",
          "To create references to list items",
          "Keys are optional and have no specific purpose"
        ],
        correctAnswer: 1
      }
    ];
    
    setQuestions(mockQuestions);
    
    // Initialize selected answers array
    const savedAnswers = getMCQAnswers();
    if (savedAnswers && savedAnswers.length === mockQuestions.length) {
      setSelectedAnswers(savedAnswers);
    } else {
      setSelectedAnswers(Array(mockQuestions.length).fill(-1));
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isLoading) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (questions.length === 0) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    // Save progress after each answer
    saveMCQAnswers(newAnswers);
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

  const handleRetry = async () => {
    setIsLoading(true);
    const setup = getInterviewSetup();
    
    if (!setup) {
      toast.error("Interview setup not found");
      navigate("/setup");
      return;
    }
    
    try {
      const generatedQuestions = await generateMCQQuestions(
        setup.jobTitle,
        setup.company,
        setup.experience
      );
      
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setSelectedAnswers(Array(generatedQuestions.length).fill(-1));
        setApiErrorOccurred(false);
        toast.success("Successfully loaded custom questions");
      } else {
        throw new Error("No questions returned");
      }
    } catch (error) {
      console.error("Error retrying question generation:", error);
      toast.error("Failed to generate questions again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (questions.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Save final MCQ answers
      saveMCQAnswers(selectedAnswers);
      
      toast.success("MCQ round completed");
      
      // Navigate to the next round
      setTimeout(() => {
        navigate("/coding");
      }, 1000);
    } catch (error) {
      toast.error("Failed to submit answers");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-apple-blue dark:border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-apple-gray-700 dark:text-gray-300">Generating questions based on your job role...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="glass dark:glass-dark p-8 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Unable to Load Questions</h2>
          <p className="text-apple-gray-700 dark:text-gray-300 mb-6">
            We couldn't load the interview questions. Please check your API key and try again.
          </p>
          <Button onClick={() => navigate("/setup")}>
            Return to Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 p-4 py-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="glass dark:glass-dark p-8 rounded-2xl shadow-lg">
          {apiErrorOccurred && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-300">Using Sample Questions</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">We couldn't generate custom questions with the Gemini API. Using sample questions instead.</p>
                  <button 
                    onClick={handleRetry}
                    className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-apple-gray-800 dark:text-white">Multiple Choice Questions</h1>
            <div className="bg-apple-blue/10 dark:bg-blue-900/30 px-4 py-2 rounded-full text-apple-blue dark:text-blue-400 font-medium">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-apple-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-apple-gray-700 dark:text-gray-300">
                {/* Display progress */}
                {selectedAnswers.filter(a => a !== -1).length} of {questions.length} answered
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
            <h2 className="text-xl font-medium mb-6 text-apple-gray-800 dark:text-white">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all 
                    ${selectedAnswers[currentQuestion] === index 
                      ? 'border-apple-blue dark:border-blue-500 bg-apple-blue/10 dark:bg-blue-900/30' 
                      : 'border-apple-gray-300 dark:border-gray-700 hover:border-apple-blue/50 dark:hover:border-blue-700'
                    }
                    dark:text-gray-200
                  `}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </div>
              ))}
            </div>
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
                  variant="default"
                >
                  {isSubmitting ? "Submitting..." : "Submit All"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQ;
