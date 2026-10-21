import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteShell } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { X } from "lucide-react";

const CALENDLY_URL = "/booking";

type Row = {
  id: number;
  role: string;
  wage: string;
  task: string;
  time: string;
  unit: "min" | "hr";
  freq: string;
};

const DEFAULT_ROWS: Row[] = [
  { id: 1, role: "Ops manager", wage: "32", task: "Manual data entry", time: "25", unit: "min", freq: "15" },
  { id: 2, role: "Account exec", wage: "28", task: "Quote follow-up", time: "15", unit: "min", freq: "20" },
  { id: 3, role: "Founder", wage: "45", task: "Monthly reporting", time: "3", unit: "hr", freq: "4" },
];

function num(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function rowHours(row: Row) {
  const perTask = row.unit === "hr" ? num(row.time) : num(row.time) / 60;
  return perTask * num(row.freq);
}

function fmtHrs(h: number) {
  return `${h.toLocaleString("en-GB", { maximumFractionDigits: 1 })} hrs`;
}

function fmtMoney(n: number, sym: string) {
  return `${sym}${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

export default function Calculator() {
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [currency, setCurrency] = useState<"£" | "$">("£");
  let nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;

  const updateRow = (id: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));
  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, role: "Role", wage: "30", task: "Task", time: "20", unit: "min", freq: "10" }]);
  };

  const totalHours = rows.reduce((sum, r) => sum + rowHours(r), 0);
  const totalDrainWeek = rows.reduce((sum, r) => sum + rowHours(r) * num(r.wage), 0);

  return (
    <SiteShell>
      <Seo
        title="Capacity & Drain Calculator"
        description="See exactly how many hours your team could unlock, and what manual work is actually costing you, before you spend a dollar on implementation."
      />
      <div className="mx-auto max-w-4xl p-6 md:p-12 min-h-[70vh]">
        <div className="mb-12 flex flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Capacity &amp; Drain Calculator
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Add your team, their wages, and the manual tasks eating their week. See the hours you could unlock and what it's actually costing you.
          </p>
        </div>

        <div className="mx-auto flex max-w-3xl justify-center gap-2 mb-8">
          {(["£", "$"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={
                "rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors " +
                (currency === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/80 bg-card/40 text-muted-foreground hover:text-foreground")
              }
              data-testid={`button-currency-${c === "£" ? "gbp" : "usd"}`}
            >
              {c === "£" ? "£ GBP" : "$ USD"}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border/80 bg-card/40 p-6 md:p-8">
            <div className="flex flex-col gap-4">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-3 rounded-2xl border border-border/50 bg-background/30 p-4 lg:grid-cols-[1.3fr_0.8fr_1.5fr_7.5rem_5rem_auto] lg:items-center"
                  data-testid={`row-calc-${row.id}`}
                >
                  <Input
                    aria-label="Role"
                    value={row.role}
                    onChange={(e) => updateRow(row.id, { role: e.target.value })}
                    placeholder="Role"
                  />
                  <Input
                    aria-label="Wage per hour"
                    type="number"
                    min="0"
                    step="0.5"
                    value={row.wage}
                    onChange={(e) => updateRow(row.id, { wage: e.target.value })}
                    placeholder={`Wage/hr (${currency})`}
                  />
                  <Input
                    aria-label="Task"
                    value={row.task}
                    onChange={(e) => updateRow(row.id, { task: e.target.value })}
                    placeholder="Task"
                  />
                  <div className="flex gap-1">
                    <Input
                      aria-label="Time per task"
                      type="number"
                      min="0"
                      step="1"
                      value={row.time}
                      onChange={(e) => updateRow(row.id, { time: e.target.value })}
                      className="w-16"
                    />
                    <select
                      aria-label="Unit"
                      value={row.unit}
                      onChange={(e) => updateRow(row.id, { unit: e.target.value as "min" | "hr" })}
                      className="rounded-md border border-input bg-transparent px-2 text-sm text-foreground"
                    >
                      <option value="min">mins</option>
                      <option value="hr">hours</option>
                    </select>
                  </div>
                  <Input
                    aria-label="Times per week"
                    type="number"
                    min="0"
                    step="1"
                    value={row.freq}
                    onChange={(e) => updateRow(row.id, { freq: e.target.value })}
                    className="w-16"
                    placeholder="×/wk"
                  />
                  <button
                    onClick={() => removeRow(row.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border/80 text-muted-foreground hover:text-foreground"
                    aria-label="Remove row"
                    data-testid={`button-remove-row-${row.id}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-4 rounded-full" onClick={addRow} data-testid="button-add-row">
              + Add row
            </Button>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-background/30 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total capacity unlocked</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight" data-testid="text-total-capacity">
                  {fmtHrs(totalHours)} / wk
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{fmtHrs(totalHours * 52)} / year</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/30 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total money drain</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight" data-testid="text-total-drain">
                  {fmtMoney(totalDrainWeek, currency)} / wk
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{fmtMoney(totalDrainWeek * 52, currency)} / year</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card/40 p-6 sm:flex-row sm:p-8">
            <p className="text-center text-base font-medium sm:text-left" data-testid="text-cta-line">
              {totalDrainWeek > 0
                ? `Your team is losing ${fmtMoney(totalDrainWeek * 52, currency)}/year to this.`
                : "Add your team above to see the real number."}
            </p>
            <Button asChild className="rounded-full bg-foreground px-6 py-6 text-base text-background hover:bg-foreground/90">
              <a href={CALENDLY_URL} data-testid="link-calculator-cta">
                Plug this leak →
              </a>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
