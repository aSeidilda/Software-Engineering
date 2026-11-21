import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Wallet,
  TrendingDown,
  Filter,
} from "lucide-react";
import {
  CATEGORIES,
  calculateTotal,
  calculateBudgetRemaining,
  type Expense,
  type ExpenseCategory,
} from "@/utils/calculations";

const EXPENSES_KEY = "expense-tracker:expenses";
const BUDGET_KEY = "expense-tracker:budget";

const SAMPLE_EXPENSES: Expense[] = [
  { id: "s1", title: "Groceries", amount: 64.2, category: "Food", date: "2026-11-02" },
  { id: "s2", title: "Subway pass", amount: 35, category: "Transport", date: "2026-11-03" },
  { id: "s3", title: "Electric bill", amount: 82.5, category: "Utilities", date: "2026-11-05" },
  { id: "s4", title: "Concert ticket", amount: 48, category: "Entertainment", date: "2026-11-08" },
  { id: "s5", title: "Coffee", amount: 6.75, category: "Food", date: "2026-11-10" },
];

function loadExpenses(): Expense[] {
  const raw = localStorage.getItem(EXPENSES_KEY);
  if (!raw) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(SAMPLE_EXPENSES));
    return SAMPLE_EXPENSES;
  }
  try {
    const parsed = JSON.parse(raw) as Expense[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function loadBudget(): number {
  const raw = localStorage.getItem(BUDGET_KEY);
  if (!raw) return 500;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 500;
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatExport(
  format: "csv" | "json" | "text",
  expenses: Expense[],
  budget: number
): { content: string; filename: string; mime: string } {
  const total = calculateTotal(expenses);
  if (format === "csv") {
    const header = "id,title,amount,category,date\n";
    const rows = expenses
      .map((e) =>
        [
          e.id,
          `"${e.title.replace(/"/g, '""')}"`,
          e.amount.toFixed(2),
          e.category,
          e.date,
        ].join(",")
      )
      .join("\n");
    return {
      content: header + rows,
      filename: "expenses.csv",
      mime: "text/csv",
    };
  } else if (format === "json") {
    return {
      content: JSON.stringify(
        { budget, total, count: expenses.length, expenses },
        null,
        2
      ),
      filename: "expenses.json",
      mime: "application/json",
    };
  } else {
    const lines = expenses.map(
      (e) => `  - ${e.date} | ${e.category} | ${e.title}: ${formatCurrency(e.amount)}`
    );
    const summary = [
      "EXPENSE SUMMARY",
      "================",
      `Budget: ${formatCurrency(budget)}`,
      `Total spent: ${formatCurrency(total)}`,
      `Remaining: ${formatCurrency(calculateBudgetRemaining(total, budget))}`,
      `Transactions: ${expenses.length}`,
      "",
      "Transactions:",
      ...lines,
    ].join("\n");
    return {
      content: summary,
      filename: "expenses.txt",
      mime: "text/plain",
    };
  }
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface FormState {
  title: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
}

const emptyForm: FormState = {
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
};

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [budget, setBudget] = useState<number>(() => loadBudget());
  const [budgetInput, setBudgetInput] = useState<string>(String(budget));

  const [filter, setFilter] = useState<ExpenseCategory | "All">("All");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, String(budget));
  }, [budget]);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? expenses
        : expenses.filter((e) => e.category === filter),
    [expenses, filter]
  );

  const total = useMemo(() => calculateTotal(filtered), [filtered]);
  const budgetRemaining = calculateBudgetRemaining(total, budget);
  const budgetPct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
  const overBudget = total > budget;

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [filtered]
  );

  function openAdd() {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEdit(e: Expense) {
    setForm({
      title: e.title,
      amount: String(e.amount),
      category: e.category,
      date: e.date,
    });
    setEditingId(e.id);
    setIsFormOpen(true);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    if (editingId) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, title: form.title.trim(), amount, category: form.category, date: form.date }
            : e
        )
      );
    } else {
      setExpenses((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: form.title.trim(),
          amount,
          category: form.category,
          date: form.date,
        },
      ]);
    }
    setIsFormOpen(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function handleBudgetSave() {
    const n = parseFloat(budgetInput);
    if (Number.isFinite(n) && n >= 0) setBudget(n);
  }

  function handleExport(format: "csv" | "json" | "text") {
    const out = formatExport(format, filtered, budget);
    downloadFile(out.content, out.filename, out.mime);
  }

  const categoryColors: Record<ExpenseCategory, string> = {
    Food: "bg-amber-100 text-amber-700",
    Transport: "bg-sky-100 text-sky-700",
    Utilities: "bg-emerald-100 text-emerald-700",
    Entertainment: "bg-rose-100 text-rose-700",
    Other: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Expense Tracker
              </h1>
              <p className="text-sm text-slate-500">
                Track spending against your monthly budget
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95"
          >
            <Plus size={16} /> Add
          </button>
        </header>

        {/* Budget overview */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Spending vs. budget
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatCurrency(total)}
                <span className="text-base font-normal text-slate-400">
                  {" "}
                  / {formatCurrency(budget)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5">
                <TrendingDown size={14} className="text-slate-500" />
                <span
                  className={`text-sm font-medium tabular-nums ${
                    overBudget ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {overBudget ? "Over by " : "Remaining "}
                  {formatCurrency(Math.abs(budgetRemaining))}
                </span>
              </div>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overBudget
                  ? "bg-rose-500"
                  : budgetPct > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm tabular-nums focus:border-slate-400 focus:outline-none"
              min={0}
            />
            <button
              onClick={handleBudgetSave}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Set budget
            </button>
          </div>
        </section>

        {/* Filters + export */}
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  filter === c
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Download size={15} className="mr-1 text-slate-400" />
            {(["csv", "json", "text"] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleExport(f)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium uppercase text-slate-600 transition hover:bg-slate-50"
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Expense list */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Wallet size={20} />
              </div>
              <p className="text-sm font-medium text-slate-600">
                No expenses {filter !== "All" ? `in ${filter}` : "yet"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Click "Add" to record your first one.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sorted.map((e) => (
                <li
                  key={e.id}
                  className="group flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-800">
                        {e.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[e.category]}`}
                      >
                        {e.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{e.date}</p>
                  </div>
                  <div className="shrink-0 text-right font-semibold tabular-nums text-slate-800">
                    {formatCurrency(e.amount)}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(e)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Saved locally in your browser · {expenses.length} total transactions
        </p>
      </div>

      {/* Add/Edit modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit expense" : "Add expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  placeholder="e.g. Lunch"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums focus:border-slate-400 focus:outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as ExpenseCategory,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-95"
                >
                  {editingId ? "Save changes" : "Add expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
