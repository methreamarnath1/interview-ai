
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/Button";
import { getApiKey, saveApiKey, saveThemePreference, getThemePreference } from "@/utils/localStorage";

const ApiKey = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if API key already exists
    const existingKey = getApiKey();
    if (existingKey) {
      setHasExistingKey(true);
      setApiKey(existingKey);
    }

    // Load theme preference
    setIsDarkMode(getThemePreference());
    
    // Apply dark mode class if needed
    if (getThemePreference()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveThemePreference(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }

    setIsLoading(true);
    
    try {
      // Save the API key to local storage
      saveApiKey(apiKey);
      
      toast.success("API key saved successfully");
      
      // Navigate to setup page
      setTimeout(() => {
        navigate("/setup");
      }, 1000);
    } catch (error) {
      toast.error("Failed to save API key");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-white dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-apple-gray-200 dark:bg-gray-700 text-apple-gray-700 dark:text-gray-200"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="glass dark:glass-dark max-w-md w-full p-8 rounded-2xl">
        <h1 className="text-2xl font-semibold mb-6 text-center dark:text-white">
          {hasExistingKey ? "Your Gemini API Key" : "Enter Your Gemini API Key"}
        </h1>
        
        {hasExistingKey && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
            <p>You already have an API key saved. You can use it or change it below.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-apple-gray-700 dark:text-gray-300">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="block w-full px-4 py-3 border border-apple-gray-300 dark:border-gray-700 rounded-lg 
                        focus:ring-2 focus:ring-apple-blue dark:focus:ring-blue-500 focus:border-transparent
                        bg-white dark:bg-gray-800 text-apple-gray-900 dark:text-gray-100"
              placeholder="Enter your Gemini API key"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3"
          >
            {isLoading ? "Saving..." : hasExistingKey ? "Update API Key" : "Save API Key"}
          </Button>
          
          {hasExistingKey && (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/setup")}
              className="w-full py-3 mt-3"
            >
              Continue to Interview Setup
            </Button>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-apple-gray-600 dark:text-gray-400 mb-2">
            Don't have an API key?
          </p>
          <a 
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-apple-blue dark:text-blue-400 hover:underline text-sm font-medium"
          >
            Get your free API key from Google AI Studio
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKey;
