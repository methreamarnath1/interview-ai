
import { ArrowRight, Code, PenTool, Briefcase, MessageCircle } from "lucide-react";
import Button from "@/components/Button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const [animatedText, setAnimatedText] = useState("");
  const fullText = "AI-Powered Interviews";
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setAnimatedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] h-40 w-40 bg-blue-400/10 dark:bg-blue-400/5 rounded-full filter blur-xl animate-float"></div>
        <div className="absolute top-[30%] right-[15%] h-60 w-60 bg-purple-400/10 dark:bg-purple-400/5 rounded-full filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[20%] left-[20%] h-40 w-40 bg-green-400/10 dark:bg-green-400/5 rounded-full filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 dark:opacity-5" />
        
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight sm:text-7xl mb-6 dark:text-white">
              <span className="block">Crack Your Dream Job</span>
              <span className="block text-gradient text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                with {animatedText}<span className="animate-pulse">|</span>
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto animate-slide-up">
              Interview.ai generates personalized interview experiences for any role, evaluates your 
              performance, and provides instant AI feedback to help you land your dream job.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/apikey">
                <Button size="lg" className="group shadow-lg hover:shadow-blue-500/20 transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 dark:from-blue-500 dark:to-violet-500">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Learn how it works
                <ArrowRight className="ml-1 h-3 w-3" />
              </a>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 max-w-3xl mx-auto">
              {[
                { number: "100+", label: "Job Roles" },
                { number: "500+", label: "Companies" },
                { number: "5,000+", label: "Users" },
                { number: "20,000+", label: "Interviews" }
              ].map((stat, index) => (
                <div key={index} className="glass dark:glass-dark p-4 rounded-xl transform transition-all duration-300 hover:translate-y-[-4px]">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">How It Works</h2>
          <p className="text-slate-600 dark:text-slate-300 text-center max-w-2xl mx-auto mb-16">
            Our AI-powered platform adapts to any job role, creating custom interview rounds and providing 
            personalized feedback to help you succeed.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Briefcase className="h-6 w-6 text-blue-500" />,
                title: "Enter Job Details",
                description: "Specify your target role, company, and job description for a personalized experience."
              },
              {
                icon: <Code className="h-6 w-6 text-violet-500" />,
                title: "AI Interview Generation",
                description: "Our AI creates realistic multi-round interviews tailored to your specific needs."
              },
              {
                icon: <PenTool className="h-6 w-6 text-emerald-500" />,
                title: "Complete Challenges",
                description: "Solve technical problems and answer questions with real-time guidance."
              },
              {
                icon: <MessageCircle className="h-6 w-6 text-amber-500" />,
                title: "Get AI Feedback",
                description: "Receive detailed analysis and actionable suggestions for improvement."
              }
            ].map((step, index) => (
              <div
                key={step.title}
                className="glass dark:glass-dark p-6 rounded-2xl transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-900/30 -z-10"></div>
        
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-400/10 dark:bg-blue-400/5 rounded-full filter blur-xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-violet-400/10 dark:bg-violet-400/5 rounded-full filter blur-xl"></div>
          
          <h2 className="text-3xl font-bold mb-6 dark:text-white">Ready to Begin?</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-10">
            Start your interview preparation journey with AI-powered guidance today.
          </p>
          <Link to="/apikey">
            <Button size="lg" className="group shadow-lg hover:shadow-blue-500/20 transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 dark:from-blue-500 dark:to-violet-500">
              Start Your Interview
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
