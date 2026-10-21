import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CALENDLY_URL = "/booking";

function num(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtHrs(h: number) {
  return `${h.toLocaleString("en-GB", { maximumFractionDigits: 1 })} hrs`;
}

function fmtMoney(n: number, sym: string) {
  return `${sym}${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

/** Single-task version of the capacity/drain calculator, meant to be dropped inline
 * into a blog post next to the paragraph making the claim it's illustrating.
 * See the full multi-person version at /calculator. */
export function CapacityCalculatorInline() {
  const [mode, setMode] = useState<"hourly" | "salary">("hourly");
  const [hourly, setHourly] = useState("35");
  const [salary, setSalary] = useState("45000");
  const [hoursPerWeek, setHoursPerWeek] = useState("37.5");
  const [time, setTime] = useState("25");
  const [unit, setUnit] = useState<"min" | "hr">("min");
  const [freq, setFreq] = useState("12");
  const [currency, setCurrency] = useState<"£" | "$">("£");

  const wage = mode === "hourly" ? num(hourly) : num(salary) / (Math.max(num(hoursPerWeek), 1) * 52);
  const perTaskHours = unit === "hr" ? num(time) : num(time) / 60;
  const hoursWeek = perTaskHours * num(freq);
  const drainWeek = hoursWeek * wage;

  return (
    <div className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-8" data-testid="widget-capacity-calc-inline">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">What's this one task costing you?</p>
        <div className="flex gap-1">
          {(["£", "$"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (currency === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/80 text-muted-foreground hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setMode("hourly")}
          className={
            "flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
            (mode === "hourly" ? "border-foreground bg-foreground text-background" : "border-border/80 text-muted-foreground")
          }
        >
          Hourly wage
        </button>
        <button
          onClick={() => setMode("salary")}
          className={
            "flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
            (mode === "salary" ? "border-foreground bg-foreground text-background" : "border-border/80 text-muted-foreground")
          }
        >
          Annual salary
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {mode === "hourly" ? (
          <div>
            <label className="text-xs text-muted-foreground">Hourly wage ({currency})</label>
            <Input type="number" min="0" step="0.5" value={hourly} onChange={(e) => setHourly(e.target.value)} />
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Annual salary ({currency})</label>
              <Input type="number" min="0" step="500" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hours worked / week</label>
              <Input type="number" min="1" step="0.5" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} />
            </div>
          </>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Time per task</label>
          <div className="flex gap-1">
            <Input type="number" min="0" step="1" value={time} onChange={(e) => setTime(e.target.value)} />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "min" | "hr")}
              className="rounded-md border border-input bg-transparent px-2 text-sm text-foreground"
            >
              <option value="min">mins</option>
              <option value="hr">hours</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Times per week</label>
          <Input type="number" min="0" step="1" value={freq} onChange={(e) => setFreq(e.target.value)} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/50 bg-background/30 p-4">
          <p className="text-xs text-muted-foreground">Capacity unlocked</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{fmtHrs(hoursWeek)} / wk</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-background/30 p-4">
          <p className="text-xs text-muted-foreground">Money drain</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{fmtMoney(drainWeek, currency)} / wk</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {drainWeek > 0
            ? `That's ${fmtMoney(drainWeek * 52, currency)}/year on this task alone.`
            : "Fill in the numbers above to see the yearly cost."}
        </p>
        <Button asChild size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          <a href={CALENDLY_URL}>Plug this leak →</a>
        </Button>
      </div>
    </div>
  );
}
