
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { getInterviewSetup, saveCodingSubmission, getCodingSubmission, getThemePreference, hasPreviousRoundCompleted } from "@/utils/localStorage";
import { generateCodingProblem } from "@/utils/geminiAPI";
import Editor from "@monaco-editor/react";

interface CodingProblem {
  title: string;
  description: string;
  examples: string[];
  constraints: string[];
  complexity: string;
}

const Coding = () => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs");
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [isTechnicalRole, setIsTechnicalRole] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the previous round was completed
    if (!hasPreviousRoundCompleted("coding")) {
      toast.error("Please complete the MCQ round first");
      navigate("/mcq");
      return;
    }
    
    // Check for existing submission
    const savedCode = getCodingSubmission();
    if (savedCode) {
      setCode(savedCode);
    }
    
    // Check if interview setup exists
    const setup = getInterviewSetup();
    if (!setup) {
      toast.error("Interview setup not found");
      navigate("/setup");
      return;
    }
    
    // Determine if this is a technical role
    const technical = setup.jobTitle.toLowerCase().includes("developer") || 
                      setup.jobTitle.toLowerCase().includes("engineer") || 
                      setup.jobTitle.toLowerCase().includes("programmer") || 
                      setup.jobTitle.toLowerCase().includes("software") || 
                      setup.jobTitle.toLowerCase().includes("data") || 
                      setup.jobTitle.toLowerCase().includes("coding");
    
    setIsTechnicalRole(technical);
    
    // Set editor theme based on user preference
    const isDarkMode = getThemePreference();
    setTheme(isDarkMode ? "vs-dark" : "vs");
    
    const loadProblem = async () => {
      try {
        // Generate a coding problem using Gemini API
        const generatedProblem = await generateCodingProblem(
          setup.jobTitle,
          setup.company,
          setup.experience,
          setup.jobDescription
        );
        
        setProblem(generatedProblem);
        
        // Set default starter code based on language and problem
        if (!savedCode) {
          if (technical) {
            setCode(getStarterCode(language, generatedProblem.title));
          } else {
            setCode("// Write your answer here\n\n");
          }
        }
      } catch (error) {
        console.error("Failed to generate problem:", error);
        toast.error("Failed to generate problem. Using a default problem instead.");
        
        // Set a fallback problem
        const fallbackProblem: CodingProblem = technical ? 
          {
            title: "Find Missing Number",
            description: "Implement a function that takes an array of n-1 integers in the range [1, n] and returns the missing number from the sequence.",
            examples: [
              "Input: [1, 2, 4, 6, 3, 7, 8], Output: 5",
              "Input: [1, 2, 3, 5], Output: 4"
            ],
            constraints: [
              "The array contains n-1 distinct integers in the range [1, n]",
              "The missing number is unique"
            ],
            complexity: "Expected time complexity is O(n) and space complexity is O(1)"
          } : 
          {
            title: "Marketing Campaign Strategy",
            description: "A mid-size company wants to increase its market share by 15% in the next year. With limited budget, design a marketing strategy that maximizes ROI.",
            examples: [
              "Consider digital marketing, traditional advertising, and partnership opportunities",
              "Include budget allocation recommendations"
            ],
            constraints: [
              "Total marketing budget: $200,000",
              "Timeline: 12 months",
              "Must include performance metrics"
            ],
            complexity: "Include implementation timeline and success criteria"
          };
        
        setProblem(fallbackProblem);
        
        // Set default starter code if no saved code
        if (!savedCode) {
          if (technical) {
            setCode(getStarterCode(language, fallbackProblem.title));
          } else {
            setCode("// Write your answer here\n\n");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProblem();
  }, [navigate]);

  const getStarterCode = (lang: string, problemTitle: string) => {
    const functionName = problemTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '')
      .replace(/^[a-z]/, (match) => match.toLowerCase());
    
    switch (lang) {
      case "javascript":
        return `// Write your solution in JavaScript
function ${functionName}(arr) {
  // Your code here
}

// Test your solution
const result = ${functionName}([1, 2, 4, 6, 3, 7, 8]);
console.log(result);
`;
      case "python":
        return `# Write your solution in Python
def ${functionName}(arr):
    # Your code here
    pass

# Test your solution
result = ${functionName}([1, 2, 4, 6, 3, 7, 8])
print(result)
`;
      case "java":
        return `// Write your solution in Java
public class Solution {
    public static int ${functionName}(int[] arr) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        int[] input = {1, 2, 4, 6, 3, 7, 8};
        System.out.println(${functionName}(input));
    }
}
`;
      case "cpp":
        return `// Write your solution in C++
#include <iostream>
#include <vector>

int ${functionName}(std::vector<int>& arr) {
    // Your code here
    return 0;
}

int main() {
    std::vector<int> input = {1, 2, 4, 6, 3, 7, 8};
    std::cout << ${functionName}(input) << std::endl;
    return 0;
}
`;
      default:
        return "// Write your code here";
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Ask user before changing if they already wrote code
    if (code.trim() && code !== getStarterCode(language, problem?.title || "") && code !== "// Write your answer here\n\n") {
      if (window.confirm("Changing language will reset your code. Continue?")) {
        if (isTechnicalRole) {
          setCode(getStarterCode(newLang, problem?.title || ""));
        } else {
          setCode("// Write your answer here\n\n");
        }
      } else {
        e.preventDefault();
        e.target.value = language;
        return;
      }
    } else {
      if (isTechnicalRole) {
        setCode(getStarterCode(newLang, problem?.title || ""));
      } else {
        setCode("// Write your answer here\n\n");
      }
    }
  };

  const handleRunCode = () => {
    // Only JavaScript can be run in the browser
    if (language !== "javascript") {
      toast.error("Only JavaScript can be executed in the browser");
      return;
    }
    
    try {
      // Create a new Function from the code string and execute it
      const executeCode = new Function(code);
      executeCode();
      toast.success("Code executed successfully");
    } catch (error) {
      console.error("Code execution error:", error);
      toast.error(`Error executing code: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save code to local storage
      saveCodingSubmission(code);
      
      toast.success("Solution submitted successfully");
      
      // Navigate to next round
      setTimeout(() => {
        navigate("/system-design");
      }, 1000);
    } catch (error) {
      toast.error("Failed to submit solution");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="ml-4 text-apple-gray-700 dark:text-gray-300">Generating {isTechnicalRole ? "coding challenge" : "case study"}...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex items-center justify-center">
        <div className="glass dark:glass-dark p-8 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Error Loading Problem</h2>
          <p className="text-apple-gray-700 dark:text-gray-300 mb-6">
            We encountered an issue loading the problem. Please try again.
          </p>
          <Button onClick={() => navigate("/mcq")}>
            Back to MCQ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 p-4 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="glass dark:glass-dark p-8 rounded-2xl">
          <h1 className="text-2xl font-semibold mb-6 dark:text-white">
            {isTechnicalRole ? "Coding Challenge" : "Case Study"}
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-3 dark:text-gray-200">{problem.title}</h2>
            <div className="p-4 bg-apple-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="mb-4 dark:text-gray-300 whitespace-pre-line">
                {problem.description}
              </p>
              
              {problem.examples.length > 0 && (
                <>
                  <p className="mb-2 dark:text-gray-300">
                    {isTechnicalRole ? "Examples:" : "Requirements:"}
                  </p>
                  <pre className="bg-apple-gray-200 dark:bg-gray-700 p-2 rounded text-apple-gray-800 dark:text-gray-300 overflow-x-auto mb-4 whitespace-pre-line">
                    {problem.examples.join('\n')}
                  </pre>
                </>
              )}
              
              {problem.constraints.length > 0 && (
                <>
                  <p className="mb-2 dark:text-gray-300">
                    {isTechnicalRole ? "Constraints:" : "Limitations:"}
                  </p>
                  <ul className="list-disc pl-5 mb-4 dark:text-gray-300">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {problem.complexity && (
                <p className="mb-2 dark:text-gray-300">
                  <strong>{isTechnicalRole ? "Expected Complexity:" : "Expectations:"}</strong> {problem.complexity}
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              {isTechnicalRole ? (
                <>
                  <label htmlFor="language" className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300 mb-1">
                    Select Language:
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={handleLanguageChange}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-apple-gray-300 dark:border-gray-700 rounded-lg text-apple-gray-800 dark:text-gray-200"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </>
              ) : (
                <p className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300">
                  Write your solution in the text editor below
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              {isTechnicalRole && language === "javascript" && (
                <Button 
                  onClick={handleRunCode}
                  variant="outline"
                >
                  Run Code
                </Button>
              )}
              <Button
                onClick={() => {
                  toast.success("Solution saved");
                  saveCodingSubmission(code);
                }}
                variant="outline"
              >
                Save
              </Button>
            </div>
          </div>
          
          <div className="mb-6 border border-apple-gray-300 dark:border-gray-700 rounded-lg overflow-hidden h-96">
            <Editor
              height="100%"
              language={isTechnicalRole ? language : "markdown"}
              value={code}
              theme={theme}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => navigate("/mcq")}
              variant="outline"
            >
              Back to MCQ
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
  );
};

export default Coding;
