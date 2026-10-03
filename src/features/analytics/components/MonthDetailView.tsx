import React, { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../../../components/common/Card';
import { Expense } from '../../../types/expense';
import { CATEGORIES, PAYMENT_METHODS } from '../../../config/constants';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { MONTH_FULL_NAMES, MONTH_NAMES, groupByMonth, sumAmount } from '../services/monthUtils';
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';

export interface MonthDetailViewProps {
  expenses: Expense[];
  monthIdx: number;
  currency: string;
  onBack: () => void;
  onChangeMonth: (idx: number) => void;
}

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 12,
  fontSize: 12,
  color: '#f1f5f9'
};

export const MonthDetailView: React.FC<MonthDetailViewProps> = ({
  expenses,
  monthIdx,
  currency,
  onBack,
  onChangeMonth
}) => {
  const now = new Date();
  const currentIdx = now.getFullYear() * 12 + now.getMonth();
  const year = Math.floor(monthIdx / 12);
  const month = monthIdx % 12;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = monthIdx === currentIdx;
  const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth;

  const byMonth = useMemo(() => groupByMonth(expenses), [expenses]);
  const monthExpenses = byMonth[monthIdx] || [];
  const total = sumAmount(monthExpenses);
  const prevTotal = sumAmount(byMonth[monthIdx - 1]);
  const changePct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  const earliestIdx = expenses.length
    ? Math.min(...expenses.map((e) => (e.date ? Number(e.date.slice(0, 4)) * 12 + Number(e.date.slice(5, 7)) - 1 : currentIdx)))
    : currentIdx;

  // Category breakdown
  const categories = CATEGORIES.map((c) => {
    const items = monthExpenses.filter((e) => e.category === c.id);
    return { ...c, amount: sumAmount(items), count: items.length };
  })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Daily totals
  const daily = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const items = monthExpenses.filter((e) => Number(e.date.split('-')[2]) === day);
    return { day, amount: sumAmount(items) };
  });
  const peakDay = daily.reduce((best, d) => (d.amount > best.amount ? d : best), { day: 0, amount: 0 });

  // Weekly totals
  const weeks = Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => {
    const start = i * 7 + 1;
    const end = Math.min(start + 6, daysInMonth);
    const items = monthExpenses.filter((e) => {
      const d = Number(e.date.split('-')[2]);
      return d >= start && d <= end;
    });
    return { name: `Week ${i + 1}`, range: `${start}–${end} ${MONTH_NAMES[month]}`, amount: sumAmount(items), count: items.length };
  });

  // Payment methods
  const payments = PAYMENT_METHODS.map((p) => {
    const items = monthExpenses.filter((e) => e.paymentMethod === p.id);
    return { id: p.id, label: p.label, amount: sumAmount(items), count: items.length };
  })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.amount - a.amount);

  const transactions = [...monthExpenses].sort(
    (a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChangeMonth(monthIdx - 1)}
            disabled={monthIdx <= earliestIdx}
            aria-label="Previous month"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeMonth(monthIdx + 1)}
            disabled={monthIdx >= currentIdx}
            aria-label="Next month"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-100">
          {MONTH_FULL_NAMES[month]} {year}
        </h2>
        <p className="text-xs text-slate-400">Complete expense report for the month</p>
      </div>

      {/* Totals */}
      <Card variant="glow" className="space-y-4">
        <div className="text-center">
          <p className="text-xs text-slate-400">Total Expense</p>
          <p className="text-3xl font-extrabold text-slate-100">{formatCurrency(total, currency)}</p>
          {changePct !== null && (
            <p
              className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                changePct > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {changePct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(changePct)}% {changePct > 0 ? 'more' : 'less'} than {MONTH_NAMES[(monthIdx - 1 + 120) % 12]}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Transactions</p>
            <p className="text-sm font-bold text-slate-100">{monthExpenses.length}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Daily Avg</p>
            <p className="text-sm font-bold text-slate-100">
              {formatCurrency(total / Math.max(elapsedDays, 1), currency, true)}
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Highest Day</p>
            <p className="text-sm font-bold text-slate-100">
              {peakDay.amount > 0 ? `${peakDay.day} ${MONTH_NAMES[month]}` : '—'}
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Largest Expense</p>
            <p className="text-sm font-bold text-slate-100">
              {formatCurrency(Math.max(0, ...monthExpenses.map((e) => e.amount)), currency, true)}
            </p>
          </div>
        </div>
      </Card>

      {monthExpenses.length === 0 ? (
        <Card variant="default" className="py-8 text-center">
          <p className="text-xs font-bold text-slate-200">No expenses recorded in this month</p>
        </Card>
      ) : (
        <>
          {/* Category chart */}
          <Card variant="glass" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Category-wise Expenses</h3>
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="90%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categories.map((c) => (
                      <Cell key={c.id} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v, currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400">Total</span>
                <span className="text-base font-extrabold text-slate-100">{formatCurrency(total, currency, true)}</span>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((c) => {
                const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-slate-200">{c.name}</span>
                        <span className="text-slate-500 text-[11px]">· {c.count}</span>
                      </div>
                      <span>
                        <span className="text-slate-100 font-bold">{formatCurrency(c.amount, currency)}</span>
                        <span className="text-slate-500 text-[11px] ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Daily chart */}
          <Card variant="glass" className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100">Daily Spending</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v, currency, true)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [formatCurrency(v, currency), 'Spent']}
                    labelFormatter={(d) => `${d} ${MONTH_NAMES[month]}`}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#dailyFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly chart */}
          <Card variant="glass" className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100">Week-wise Expenses</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeks} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCurrency(v, currency, true)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                    formatter={(v: number) => [formatCurrency(v, currency), 'Spent']}
                    labelFormatter={(_, p) => (p && p[0] ? p[0].payload.range : '')}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="divide-y divide-slate-800/60">
              {weeks.map((w) => (
                <div key={w.name} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{w.name}</span>
                    <span className="text-slate-500 ml-2">{w.range}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-100">{formatCurrency(w.amount, currency)}</span>
                    <span className="text-slate-500 text-[11px] ml-1">({w.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment methods */}
          {payments.length > 0 && (
            <Card variant="default" className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100">Payment Methods</h3>
              <div className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{p.label}</span>
                    <span>
                      <span className="font-bold text-slate-100">{formatCurrency(p.amount, currency)}</span>
                      <span className="text-slate-500 text-[11px] ml-1">({p.count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* All transactions */}
          <Card variant="default" className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100">All Transactions ({transactions.length})</h3>
            <div className="divide-y divide-slate-800/60">
              {transactions.map((e) => {
                const cat = CATEGORIES.find((c) => c.id === e.category) || CATEGORIES[8];
                return (
                  <div key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">{e.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {e.date} · {cat.name}
                          {e.groupName ? ` · ${e.groupName}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-slate-100 shrink-0">
                      {formatCurrency(e.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
