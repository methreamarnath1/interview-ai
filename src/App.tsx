
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DarkModeToggle from "./components/DarkModeToggle";
import Index from "./pages/Index";
import ApiKey from "./pages/ApiKey";
import Setup from "./pages/Setup";
import MCQ from "./pages/MCQ";
import Coding from "./pages/Coding";
import SystemDesign from "./pages/SystemDesign";
import HR from "./pages/HR";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/apikey" element={<ApiKey />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/mcq" element={<MCQ />} />
          <Route path="/coding" element={<Coding />} />
          <Route path="/system-design" element={<SystemDesign />} />
          <Route path="/hr" element={<HR />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
