import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { Seo } from "@/components/seo";

const CATEGORIES = [
  {
    id: 'bottleneck',
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
    question: 'Can every workflow stage be traced to a single owner?',
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
    question: 'Is there a single source of truth all data can pass through?',
    descriptions: {
      1: "Data lives in multiple places and no one is sure which version is correct.",
      2: "There is one main system, but teams regularly work from exports, spreadsheets, or their own copies.",
      3: "Most data flows through one place, but exceptions and workarounds are common.",
      4: "A central source exists and is mostly trusted, with minor gaps or inconsistencies.",
      5: "All data passes through a single, reliable source that the whole business operates from."
    }
  },
  {
    id: 'decisionConsistency',
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

const DEFAULT_SCORES = {
  bottleneck: 3,
  roleClarity: 3,
  processClarity: 3,
  dataVisibility: 3,
  decisionConsistency: 3
};

function getResultTier(score: number) {
  if (score >= 23) {
    return {
      title: "Force Multiplier",
      message: "You are in the acceleration phase. Your operations are solid, and automation will act as a true force multiplier for your growth.",
      colorClass: "text-green-400"
    };
  }
  if (score >= 18) {
    return {
      title: "Ready to Scale",
      message: "Your foundation is strong. Implementing automation now will compound your gains and drive significant efficiency.",
      colorClass: "text-blue-400"
    };
  }
  if (score >= 11) {
    return {
      title: "Partial Readiness",
      message: "You have a mix of strengths and weaknesses. Focus on fixing the weaker operational areas before heavily investing in automation.",
      colorClass: "text-yellow-400"
    };
  }
  return {
    title: "Automation Will Backfire",
    message: "Your current operations need stabilization. Applying automation to broken processes will only scale chaos. Focus on fundamentals first.",
    colorClass: "text-red-400"
  };
}

export default function Score() {
  const [scores, setScores] = useState<Record<string, number>>(DEFAULT_SCORES);
  const [showResults, setShowResults] = useState(false);

  // Reset the assessment whenever this page is navigated to
  useEffect(() => {
    setShowResults(false);
    setScores(DEFAULT_SCORES);
  }, []);

  const handleScoreChange = (id: string, value: string) => {
    setScores(prev => ({ ...prev, [id]: parseInt(value) }));
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const tier = getResultTier(totalScore);

  return (
    <SiteShell>
      <Seo
        title="Automation Readiness Score"
        description="Evaluate your operational foundation before investing in AI or automation — get your Automation Readiness Score in minutes."
      />
      {showResults ? (
        <div className="flex min-h-[70vh] items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-3xl rounded-3xl border border-border/80 bg-card/40 p-8 md:p-12 backdrop-blur-sm">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Your Result</h2>
              <div className="mb-6 flex items-center justify-center gap-4">
                <span className="text-6xl font-bold">{totalScore}</span>
                <span className="text-2xl text-muted-foreground">/ 25</span>
              </div>
              <h1 className={`mb-4 text-4xl font-semibold tracking-tight ${tier.colorClass}`}>{tier.title}</h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{tier.message}</p>
            </div>

            <div className="mb-10">
              <h3 className="text-center text-xl font-semibold">Your score shows exactly where to focus. Let's turn that into a clear action plan.</h3>
            </div>

            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-base"
                onClick={() => {
                  setShowResults(false);
                  setScores(DEFAULT_SCORES);
                }}
              >
                Retake Assessment
              </Button>
              <Button
                asChild
                className="rounded-full bg-foreground px-8 py-6 text-base text-background hover:bg-foreground/90"
              >
                <a href="https://www.noua.uk/booking">
                  Book a Strategy Call
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl p-6 md:p-12 min-h-[70vh]">
          <div className="mb-16 flex flex-col items-center text-center">
            <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">Automation Readiness Score
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Evaluate your operational foundation before investing in AI or automation.
            </p>
          </div>

          <div className="mx-auto flex max-w-2xl flex-col">
            <div className="flex flex-col gap-8">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-8">
                  <div className="mb-6">
                    <p className="text-xl font-medium text-foreground">{category.question}</p>
                  </div>

                  <div>
                    <div className="relative">
                      <div
                        className="absolute h-2 rounded-full bg-foreground pointer-events-none z-0"
                        style={{
                          width: `${(scores[category.id] - 1) * 25}%`,
                          top: '8px'
                        }}
                      />
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={scores[category.id]}
                        onChange={(e) => handleScoreChange(category.id, e.target.value)}
                        className="relative z-10 mb-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted/50 accent-foreground focus:outline-none"
                      />
                    </div>

                    <div className="mb-6 flex justify-between px-1 text-xs text-muted-foreground/50">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>

                    <div className="flex min-h-[40px] items-center justify-center rounded-xl border border-border/50 bg-background/30 p-4 text-center">
                      <span className="text-sm font-medium text-foreground/90">
                        {category.descriptions[scores[category.id] as 1 | 2 | 3 | 4 | 5]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                className="w-full max-w-[300px] rounded-full bg-foreground py-6 text-base text-background hover:bg-foreground/90"
                onClick={() => setShowResults(true)}
              >
                Calculate My Score
              </Button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}