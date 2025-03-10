
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { getInterviewSetup, saveSystemDesignAnswer, getSystemDesignAnswer, hasPreviousRoundCompleted } from "@/utils/localStorage";
import { generateSystemDesignQuestion } from "@/utils/geminiAPI";

const SystemDesign = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const navigate = useNavigate();

  // Load question and saved answer if any
  useEffect(() => {
    // Check if previous rounds are completed
    if (!hasPreviousRoundCompleted('system-design')) {
      toast.error("Please complete the coding round first");
      navigate("/coding");
      return;
    }
    
    const setup = getInterviewSetup();
    if (!setup) {
      toast.error("Interview setup not found");
      navigate("/setup");
      return;
    }

    const loadQuestion = async () => {
      try {
        // Check for saved answer first
        const savedAnswer = getSystemDesignAnswer();
        if (savedAnswer) {
          setAnswer(savedAnswer);
        }

        // Generate a system design question based on job role
        const generatedQuestion = await generateSystemDesignQuestion(
          setup.jobTitle,
          setup.experience
        );
        
        if (generatedQuestion) {
          setQuestion(generatedQuestion);
        } else {
          // Fallback question if API fails
          setQuestion(
            "Design a scalable, highly available e-commerce platform that can handle millions of users, product listings, and transactions. Focus on the system architecture, data storage, and how you would handle peak traffic during sales events."
          );
        }
      } catch (error) {
        console.error("Error loading system design question:", error);
        toast.error("Failed to load question. Using a default question instead.");
        setQuestion(
          "Design a scalable, highly available e-commerce platform that can handle millions of users, product listings, and transactions. Focus on the system architecture, data storage, and how you would handle peak traffic during sales events."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestion();
  }, [navigate]);

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

  // Auto-save answer periodically
  useEffect(() => {
    if (!answer.trim() || isLoading) return;
    
    const saveInterval = setInterval(() => {
      saveSystemDesignAnswer(answer);
    }, 10000); // Save every 10 seconds
    
    return () => clearInterval(saveInterval);
  }, [answer, isLoading]);

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the answer to local storage
      saveSystemDesignAnswer(answer);
      
      toast.success("System design answer submitted");
      
      // Navigate to the next round
      setTimeout(() => {
        navigate("/hr");
      }, 1000);
    } catch (error) {
      toast.error("Failed to submit answer");
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
        <p className="text-apple-gray-700 dark:text-gray-300">Generating a system design question based on your job role...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 p-4 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="glass dark:glass-dark p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-apple-gray-800 dark:text-white">System Design Challenge</h1>
            <div className="bg-apple-blue/10 dark:bg-blue-900/30 px-4 py-2 rounded-full text-apple-blue dark:text-blue-400 font-medium">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-3 text-apple-gray-800 dark:text-white">Question:</h2>
            <div className="p-4 bg-apple-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-apple-gray-800 dark:text-gray-200">{question}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3 text-apple-gray-800 dark:text-white">Your Answer:</h2>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your system design solution here. Consider data models, API design, scaling strategies, and potential bottlenecks."
              className="w-full h-96 p-4 bg-white dark:bg-gray-800 border border-apple-gray-300 dark:border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-apple-blue focus:border-transparent resize-none
                       text-apple-gray-800 dark:text-gray-200"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-apple-gray-600 dark:text-gray-400">
              <span>
                <strong>Tip:</strong> Include diagrams in your answer by describing them in text. 
                Mention system components, data flow, and how you handle failure scenarios.
              </span>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={() => navigate("/coding")}
                variant="outline"
              >
                Back to Coding
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit & Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDesign;
