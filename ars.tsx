import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  {
    id: 'bottleneck',
    title: 'Bottleneck Identification',
    question: 'Do you know where work slows down?',
    descriptions: {
      1: "We have no visibility into where or why work gets stuck.",
      2: "We occasionally notice slowdowns but can't pinpoint the root cause.",
      3: "We have a general idea of our bottlenecks but no formal tracking.",
      4: "We actively track bottlenecks and have plans to address them.",
      5: "We have real-time visibility and proactively manage potential bottlenecks."
    }
  },
  {
    id: 'roleClarity',
    title: 'Role Clarity',
    question: 'Is accountability clearly defined?',
    descriptions: {
      1: "Everyone does everything. No clear ownership.",
      2: "Roles exist on paper but blur in practice.",
      3: "Most people know their primary responsibilities.",
      4: "Clear accountability with few overlaps.",
      5: "Every process step has a single, unambiguous owner."
    }
  },
  {
    id: 'processClarity',
    title: 'Process Clarity',
    question: 'Are core workflows documented and repeatable?',
    descriptions: {
      1: "Everything is in people's heads. Processes change daily.",
      2: "Basic documentation exists but is rarely followed.",
      3: "Some core processes are documented and somewhat repeatable.",
      4: "Most workflows are documented and consistently followed.",
      5: "All core workflows are meticulously documented, optimized, and repeatable."
    }
  },
  {
    id: 'dataVisibility',
    title: 'Data Visibility',
    question: 'Can performance be measured in real time?',
    descriptions: {
      1: "We rely entirely on gut feeling.",
      2: "We look at data occasionally, usually after the fact.",
      3: "We have basic dashboards but data is often delayed or manual.",
      4: "Key metrics are tracked and easily accessible.",
      5: "Comprehensive, real-time data drives our operations."
    }
  },
  {
    id: 'decisionConsistency',
    title: 'Decision Consistency',
    question: 'Are decisions rule-based or reactive?',
    descriptions: {
      1: "Every situation requires a unique, reactive decision.",
      2: "We have some rules, but exceptions are the norm.",
      3: "Routine decisions follow rules; complex ones are reactive.",
      4: "Most decisions are rule-based and predictable.",
      5: "Decisions are highly consistent, governed by clear, established rules."
    }
  }
];

function getResultTier(score: number) {
  if (score >= 23) {
    return {
      title: "Force Multiplier",
      message: "You are in the acceleration phase. Your operations are solid, and automation will act as a true force multiplier for your growth.",
      color: "text-green-400"
    };
  }
  if (score >= 18) {
    return {
      title: "Ready to Scale",
      message: "Your foundation is strong. Implementing automation now will compound your gains and drive significant efficiency.",
      color: "text-blue-400"
    };
  }
  if (score >= 11) {
    return {
      title: "Partial Readiness",
      message: "You have a mix of strengths and weaknesses. Focus on fixing the weaker operational areas before heavily investing in automation.",
      color: "text-yellow-400"
    };
  }
  return {
    title: "Automation Will Backfire",
    message: "Your current operations need stabilization. Applying automation to broken processes will only scale chaos. Focus on fundamentals first.",
    color: "text-red-400"
  };
}

export default function AutomationReadinessScore() {
  const [scores, setScores] = useState<Record<string, number>>({
    bottleneck: 3,
    roleClarity: 3,
    processClarity: 3,
    dataVisibility: 3,
    decisionConsistency: 3
  });
  const [showResults, setShowResults] = useState(false);

  const handleScoreChange = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const tier = getResultTier(totalScore);

  if (showResults) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl bg-card/40 border border-border/80 rounded-3xl p-8 md:p-12 shadow-xl backdrop-blur-sm">
          <div className="text-center mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4">
              Your Result
            </h2>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-6xl font-bold">{totalScore}</span>
              <span className="text-2xl text-muted-foreground">/ 25</span>
            </div>
            <h1 className={`text-4xl font-semibold tracking-tight mb-4 ${tier.color}`}>
              {tier.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tier.message}
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-xl font-semibold mb-6 border-b border-border/50 pb-4">Score Breakdown</h3>
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-4 bg-background/20 rounded-xl border border-border/50">
                <span className="font-medium">{cat.title}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground/70 rounded-full" 
                      style={{ width: `${(scores[cat.id] / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-4 text-right">{scores[cat.id]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button 
              variant="outline" 
              className="rounded-full px-8 py-6 text-base"
              onClick={() => setShowResults(false)}
            >
              Retake Assessment
            </Button>
            <Button 
              asChild 
              className="rounded-full px-8 py-6 text-base bg-foreground text-background hover:bg-foreground/90"
            >
              <a href="https://www.noua.uk/booking" target="_blank" rel="noopener noreferrer">
                Book a Strategy Call
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Automation Readiness Score (ARS)
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Evaluate your operational foundation before investing in AI or automation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="bg-card/40 border border-border/80 rounded-3xl p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold tracking-tight mb-2">{category.title}</h3>
                  <p className="text-muted-foreground">{category.question}</p>
                </div>
                
                <div className="space-y-6">
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1"
                    value={scores[category.id]}
                    onChange={(e) => handleScoreChange(category.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) ${(scores[category.id] - 1) * 25}%, hsl(var(--muted)) ${(scores[category.id] - 1) * 25}%, hsl(var(--muted)) 100%)`
                    }}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground/70 px-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>

                  <div className="min-h-[40px] p-4 bg-background/30 rounded-xl border border-border/50 flex items-center justify-center text-center transition-all duration-200">
                    <p className="text-sm text-foreground/90 font-medium">
                      {category.descriptions[scores[category.id] as 1|2|3|4|5]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="sticky top-12 bg-card/60 border border-border/80 rounded-3xl p-8 backdrop-blur-md shadow-xl flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Current Score
              </span>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl font-bold tracking-tighter">{totalScore}</span>
                <span className="text-xl text-muted-foreground">/ 25</span>
              </div>

              <Button 
                onClick={() => setShowResults(true)}
                className="w-full rounded-full py-6 text-base bg-foreground text-background hover:bg-foreground/90 transition-all"
              >
                Calculate My Score
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
