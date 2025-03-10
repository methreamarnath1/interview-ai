// Interview setup data type
export interface InterviewSetup {
  jobTitle: string;
  company: string;
  experience: string;
  jobDescription?: string;
  timestamp: string;
}

// API Key
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem('geminiApiKey', apiKey);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem('geminiApiKey');
};

// Theme preferences
export const saveThemePreference = (isDarkMode: boolean): void => {
  localStorage.setItem('darkMode', isDarkMode.toString());
};

export const getThemePreference = (): boolean => {
  return localStorage.getItem('darkMode') === 'true';
};

// Interview setup
export const saveInterviewSetup = (setup: InterviewSetup): void => {
  localStorage.setItem('interviewSetup', JSON.stringify(setup));
};

export const getInterviewSetup = (): InterviewSetup | null => {
  const setupJSON = localStorage.getItem('interviewSetup');
  return setupJSON ? JSON.parse(setupJSON) : null;
};

// MCQ answers
export const saveMCQAnswers = (answers: number[]): void => {
  localStorage.setItem('mcqAnswers', JSON.stringify(answers));
};

export const getMCQAnswers = (): number[] | null => {
  const answersJSON = localStorage.getItem('mcqAnswers');
  return answersJSON ? JSON.parse(answersJSON) : null;
};

// Coding submissions
export const saveCodingSubmission = (code: string): void => {
  localStorage.setItem('interviewCode', code);
};

export const getCodingSubmission = (): string | null => {
  return localStorage.getItem('interviewCode');
};

// System design answers
export const saveSystemDesignAnswer = (answer: string): void => {
  localStorage.setItem('systemDesignAnswer', answer);
};

export const getSystemDesignAnswer = (): string | null => {
  return localStorage.getItem('systemDesignAnswer');
};

// HR round answers
export const saveHRAnswers = (answers: Record<string, string>): void => {
  localStorage.setItem('hrAnswers', JSON.stringify(answers));
};

export const getHRAnswers = (): Record<string, string> | null => {
  const answersJSON = localStorage.getItem('hrAnswers');
  return answersJSON ? JSON.parse(answersJSON) : null;
};

// Interview results
export const saveInterviewResults = (results: any): void => {
  localStorage.setItem('interviewResults', JSON.stringify(results));
};

export const getInterviewResults = (): any | null => {
  const resultsJSON = localStorage.getItem('interviewResults');
  return resultsJSON ? JSON.parse(resultsJSON) : null;
};

// Other utility functions for saving and retrieving data
export const clearAllInterviewData = (): void => {
  // Keep the API key but clear everything else
  const apiKey = getApiKey();
  const darkMode = getThemePreference();
  localStorage.clear();
  if (apiKey) {
    saveApiKey(apiKey);
  }
  saveThemePreference(darkMode);
};

// Function to check if user has completed all rounds
export const hasCompletedAllRounds = (): boolean => {
  // For the HR page, we only need to check if previous rounds are completed
  return Boolean(
    localStorage.getItem('mcqAnswers') &&
    localStorage.getItem('interviewCode') &&
    localStorage.getItem('systemDesignAnswer')
  );
};

// Function to check if previous round is completed
export const hasPreviousRoundCompleted = (currentRound: string): boolean => {
  switch(currentRound) {
    case 'mcq':
      // First round, no prerequisites
      return true;
    case 'coding':
      return Boolean(localStorage.getItem('mcqAnswers'));
    case 'system-design':
      return Boolean(localStorage.getItem('mcqAnswers') && localStorage.getItem('interviewCode'));
    case 'hr':
      return Boolean(
        localStorage.getItem('mcqAnswers') && 
        localStorage.getItem('interviewCode') && 
        localStorage.getItem('systemDesignAnswer')
      );
    case 'results':
      return hasCompletedAllRounds() && Boolean(localStorage.getItem('hrAnswers'));
    default:
      return false;
  }
};
