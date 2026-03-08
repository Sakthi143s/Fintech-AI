import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { api } from '../services/api';
import { formatCurrency } from '../utils/utils';
import { useRef } from 'react';
import { TrendingUp, Plus, Trash2, Loader2, ListFilter, Upload, FileText, ShieldCheck } from 'lucide-react';

interface Expense {
    id: number;
    category: string;
    amount: number;
    date: string;
    description: string;
    source?: string;
    is_anomaly?: boolean;
}

interface SummaryItem {
    category: string;
    spent: number;
    allocated: number;
    remaining: number;
    over_budget: boolean;
}

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Insurance', 'Healthcare', 'Savings', 'Personal', 'Debt', 'Education', 'Entertainment'];

export const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset } = useForm();

    const loadData = async (month: string) => {
        try {
            setLoading(true);
            const [expRes, sumRes] = await Promise.all([
                api.get(`/expenses?month=${month}`),
                api.get(`/expenses/summary?month=${month}`)
            ]);
            setExpenses(expRes.data);
            setSummary(sumRes.data.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(selectedMonth);
    }, [selectedMonth]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            await api.post('/bank/import-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            loadData(selectedMonth);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to import CSV. Please ensure it is a valid bank statement.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setAdding(true);
            await api.post('/expenses', {
                category: data.category || 'Auto',
                amount: Number(data.amount),
                date: data.date,
                description: data.description || ''
            });
            reset();
            loadData(selectedMonth);
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const deleteExpense = useCallback(async (id: number) => {
        try {
            await api.delete(`/expenses/${id}`);
            loadData(selectedMonth);
        } catch (err) {
            console.error(err);
        }
    }, [selectedMonth]);

    const memoizedExpensesList = useMemo(() => {
        if (expenses.length === 0) {
            return (
                <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                    <p>No expenses logged for {selectedMonth}</p>
                </div>
            );
        }
        return (
            <div className="space-y-3">
                {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center text-danger">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-white">{exp.category}</p>
                                    {exp.is_anomaly && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30 flex items-center">
                                            ⚠️ Anomaly Detected
                                        </span>
                                    )}
                                    {exp.source === 'csv_import' && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded text-primary bg-primary/10 border border-primary/20">
                                            CSV
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">{exp.description || 'No description'} • {format(new Date(exp.date), 'MMM dd, yyyy')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-danger text-lg">-{formatCurrency(exp.amount)}</span>
                            <button
                                onClick={() => deleteExpense(exp.id)}
                                className="p-2 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }, [expenses, selectedMonth, deleteExpense]);

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Expense Tracking</h1>
                    <p className="text-gray-400">Log your daily spending and monitor remaining budgets</p>
                </div>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-surface border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6 lg:col-span-1">
                    <div className="glass-card p-6 h-fit">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Log Expense</h2>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                                <input
                                    id="date"
                                    {...register('date', { required: true })}
                                    type="date"
                                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-[border-color,box-shadow]"
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <select
                                    id="category"
                                    {...register('category')}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary transition-[border-color,box-shadow]"
                                >
                                    <option value="">Auto-Categorize (AI)</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                                <input
                                    id="amount"
                                    {...register('amount', { required: true })}
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="250"
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-[border-color,box-shadow]"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description / Note</label>
                                <input
                                    id="description"
                                    {...register('description')}
                                    type="text"
                                    placeholder="Lunch, Uber, Groceries etc."
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-[border-color,box-shadow]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                            >
                                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Expense'}
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6 h-fit border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <Upload className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Import Bank CSV</h2>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Auto-categorize transactions directly from your bank statement.
                        </p>

                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full bg-surface border border-white/10 hover:bg-white/5 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-4"
                        >
                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileText className="w-4 h-4" /> Select CSV File</>}
                        </button>

                        <div className="flex items-start gap-2 p-3 bg-surface/50 rounded-lg text-xs text-gray-400 border border-white/5">
                            <ShieldCheck className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <p>We only analyze transaction history. Your banking credentials are never requested or stored.</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Remaining Budgets</h2>
                        </div>
                        {summary.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {summary.map(s => (
                                    <div key={s.category} className="p-4 rounded-xl bg-surface border border-white/5 relative overflow-hidden group">
                                        {s.over_budget && <div className="absolute top-0 right-0 right-0 w-2 h-full bg-danger"></div>}
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium text-white">{s.category}</h3>
                                            <span className={`text-sm font-bold ${s.over_budget ? 'text-danger' : 'text-success'}`}>
                                                {s.over_budget ? '-' : '+'}{formatCurrency(Math.abs(s.remaining))} left
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${s.over_budget ? 'bg-danger' : s.remaining / s.allocated < 0.2 ? 'bg-warning' : 'bg-success'}`}
                                                style={{ width: `${Math.min((s.spent / s.allocated) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                            <span>Spent: {formatCurrency(s.spent)}</span>
                                            <span>Total: {formatCurrency(s.allocated)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No budgets set or expenses logged for this month.</p>
                        )}
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gray-300">
                                <ListFilter className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                        </div>

                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : memoizedExpensesList}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};
