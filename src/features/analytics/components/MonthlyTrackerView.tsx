import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../../../components/common/Card';
import { Expense } from '../../../types/expense';
import { CATEGORIES } from '../../../config/constants';
import { formatCurrency } from '../../../finance/currencyFormatter';
import { MONTH_FULL_NAMES, MONTH_NAMES, groupByMonth, monthLabel, sumAmount, toMonthIndex } from '../services/monthUtils';
import { CalendarDays, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';

export interface MonthlyTrackerViewProps {
  expenses: Expense[];
  currency: string;
  selectedIdx: number;
  onSelectMonth: (idx: number) => void;
  onOpenMonth: (idx: number) => void;
}

const TREND_MONTHS = 6;

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 12,
  fontSize: 12,
  color: '#f1f5f9'
};

export const MonthlyTrackerView: React.FC<MonthlyTrackerViewProps> = ({
  expenses,
  currency,
  selectedIdx,
  onSelectMonth,
  onOpenMonth
}) => {
  const now = new Date();
  const currentIdx = now.getFullYear() * 12 + now.getMonth();
  const setSelectedIdx = (fn: number | ((i: number) => number)) =>
    onSelectMonth(typeof fn === 'function' ? fn(selectedIdx) : fn);

  const data = useMemo(() => groupByMonth(expenses), [expenses]);

  const sum = sumAmount;

  const monthExpenses = data[selectedIdx] || [];
  const total = sum(monthExpenses);
  const prevTotal = sum(data[selectedIdx - 1]);
  const changePct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  const year = Math.floor(selectedIdx / 12);
  const month = selectedIdx % 12;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = selectedIdx === currentIdx;
  const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth;
  const dailyAvg = total / Math.max(elapsedDays, 1);

  // Week-wise: days 1-7, 8-14, 15-21, 22-28, 29-end
  const weekCount = Math.ceil(daysInMonth / 7);
  const weeks = Array.from({ length: weekCount }, (_, i) => {
    const startDay = i * 7 + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);
    const items = monthExpenses.filter((e) => {
      const day = Number(e.date.split('-')[2]);
      return day >= startDay && day <= endDay;
    });
    return {
      name: `W${i + 1}`,
      range: `${startDay}–${endDay} ${MONTH_NAMES[month]}`,
      amount: sum(items),
      count: items.length
    };
  });
  const maxWeek = Math.max(...weeks.map((w) => w.amount), 0);

  // Trend: last N months ending at the latest of (current month, selected month)
  const trendEnd = Math.max(currentIdx, selectedIdx);
  const trend = Array.from({ length: TREND_MONTHS }, (_, i) => {
    const idx = trendEnd - (TREND_MONTHS - 1 - i);
    return { idx, name: monthLabel(idx), amount: sum(data[idx]) };
  });

  // Category breakdown for the selected month
  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const categories = CATEGORIES.map((c) => ({ ...c, amount: categoryTotals[c.id] || 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const earliestIdx = expenses.length ? Math.min(...expenses.map((e) => toMonthIndex(e.date))) : currentIdx;
  const canGoPrev = selectedIdx > Math.min(earliestIdx, currentIdx - (TREND_MONTHS - 1));
  const canGoNext = selectedIdx < currentIdx;

  const years = Array.from(
    { length: Math.floor(currentIdx / 12) - Math.floor(Math.min(earliestIdx, currentIdx) / 12) + 1 },
    (_, i) => Math.floor(currentIdx / 12) - i
  );
  const yearMonths = Array.from({ length: 12 }, (_, i) => {
    const idx = year * 12 + i;
    return { idx, amount: sum(data[idx]), future: idx > currentIdx };
  });
  const yearTotal = yearMonths.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-100">Monthly Expense Tracker</h2>
        <p className="text-xs text-slate-400">Month-wise totals, weekly breakdown & history</p>
      </div>

      {/* Month selector + total */}
      <Card variant="glow" className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedIdx((i) => i - 1)}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <CalendarDays className="w-4 h-4 text-brand-400" />
            {monthLabel(selectedIdx, true)}
            {isCurrentMonth && <span className="text-[10px] font-semibold text-brand-300">(This month)</span>}
          </div>
          <button
            onClick={() => setSelectedIdx((i) => i + 1)}
            disabled={!canGoNext}
            aria-label="Next month"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setSelectedIdx(Math.min(Number(e.target.value) * 12 + month, currentIdx))}
            aria-label="Select year"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-100"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setSelectedIdx(year * 12 + Number(e.target.value))}
            aria-label="Select month"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-100"
          >
            {MONTH_FULL_NAMES.map((n, i) => (
              <option key={n} value={i} disabled={year * 12 + i > currentIdx}>{n}</option>
            ))}
          </select>
        </div>

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
              {Math.abs(changePct)}% {changePct > 0 ? 'more' : 'less'} than {monthLabel(selectedIdx - 1)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Transactions</p>
            <p className="text-sm font-bold text-slate-100">{monthExpenses.length}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Daily Avg</p>
            <p className="text-sm font-bold text-slate-100">{formatCurrency(dailyAvg, currency, true)}</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/50">
            <p className="text-[10px] text-slate-400">Prev Month</p>
            <p className="text-sm font-bold text-slate-100">{formatCurrency(prevTotal, currency, true)}</p>
          </div>
        </div>

        <button
          onClick={() => onOpenMonth(selectedIdx)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          View full {monthLabel(selectedIdx, true)} details
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </Card>


      <Card variant="glass" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">{year} Year Overview</h3>
          <span className="text-sm font-extrabold text-slate-100">{formatCurrency(yearTotal, currency)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {yearMonths.map((m) => (
            <button
              key={m.idx}
              onClick={() => onOpenMonth(m.idx)}
              disabled={m.future}
              className={`p-2.5 rounded-2xl text-left border transition-all disabled:opacity-30 ${
                m.idx === selectedIdx
                  ? 'bg-brand-600/20 border-brand-500/50'
                  : 'bg-slate-800/50 border-slate-800 hover:border-slate-600'
              }`}
            >
              <p className="text-[10px] text-slate-400 font-medium">{MONTH_NAMES[m.idx % 12]}</p>
              <p className="text-xs font-bold text-slate-100">{formatCurrency(m.amount, currency, true)}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Month-over-month trend */}
      <Card variant="glass" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Month-wise Expenses</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Tap a bar for details</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
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
              />
              <Bar
                dataKey="amount"
                radius={[8, 8, 0, 0]}
                cursor="pointer"
                onClick={(d: { idx: number }) => onOpenMonth(d.idx)}
              >
                {trend.map((t) => (
                  <Cell key={t.idx} fill={t.idx === selectedIdx ? '#10b981' : '#475569'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Week-wise */}
      <Card variant="glass" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">Week-wise Expenses</h3>
          <span className="text-xs text-slate-400 font-medium">{monthLabel(selectedIdx, true)}</span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <div key={w.name} className="py-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Week {w.name.slice(1)}</span>
                  <span className="text-slate-500 ml-2">{w.range}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-100">{formatCurrency(w.amount, currency)}</span>
                  <span className="text-slate-500 text-[11px] ml-1">({w.count})</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${maxWeek > 0 ? Math.round((w.amount / maxWeek) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Category breakdown for the month */}
      <Card variant="default" className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100">Category Breakdown</h3>
        {categories.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">No expenses recorded for this month.</p>
        ) : (
          categories.map((c) => {
            const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0;
            return (
              <div key={c.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{c.name}</span>
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
          })
        )}
      </Card>
    </div>
  );
};
