
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { saveInterviewSetup } from "@/utils/localStorage";

const Setup = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("mid-level");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !company.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Save the interview setup data to local storage
      saveInterviewSetup({
        jobTitle,
        company,
        experience,
        jobDescription,
        timestamp: new Date().toISOString(),
      });
      
      toast.success("Interview setup saved");
      
      // Navigate to the first interview round (MCQ)
      setTimeout(() => {
        navigate("/mcq");
      }, 1000);
    } catch (error) {
      toast.error("Failed to save interview setup");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="glass dark:glass-dark max-w-md w-full p-8 rounded-2xl">
        <h1 className="text-2xl font-semibold mb-6 text-center dark:text-white">Setup Your Interview</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="block w-full px-4 py-3 border border-apple-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-apple-blue focus:border-transparent"
              placeholder="e.g. Frontend Developer, HR Manager, Marketing Executive"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="block w-full px-4 py-3 border border-apple-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-apple-blue focus:border-transparent"
              placeholder="e.g. Google, Accenture, Johnson & Johnson"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="block w-full px-4 py-3 border border-apple-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-apple-blue focus:border-transparent min-h-[100px] resize-y"
              placeholder="Paste job description or key responsibilities here to generate more relevant questions..."
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="experience" className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300">
              Experience Level
            </label>
            <select
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="block w-full px-4 py-3 border border-apple-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-apple-blue focus:border-transparent"
            >
              <option value="entry-level">Entry Level (0-2 years)</option>
              <option value="mid-level">Mid Level (3-5 years)</option>
              <option value="senior">Senior (6+ years)</option>
              <option value="leadership">Leadership (Manager & Above)</option>
            </select>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3"
          >
            {isLoading ? "Starting..." : "Start Interview"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
