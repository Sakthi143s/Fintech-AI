import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { api } from '../services/api';
import { formatCurrency } from '../utils/utils';
import { useDashboardStore } from '../services/dashboardStore';
import { PieChart, Plus, Trash2, Loader2, AlertCircle, Lightbulb } from 'lucide-react';

interface Budget {
    id: number;
    category: string;
    percentage: number;
    allocated_amount: number;
    month: string;
}

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Insurance', 'Healthcare', 'Savings', 'Personal', 'Debt', 'Education', 'Entertainment'];

export const BudgetPage = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [error, setError] = useState('');

    const { intelligence, fetchDashboard } = useDashboardStore();

    const { register, handleSubmit, reset } = useForm();

    const loadBudgets = async (month: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/budget?month=${month}`);
            setBudgets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBudgets(selectedMonth);
        fetchDashboard(selectedMonth);
    }, [selectedMonth, fetchDashboard]);

    const onSubmit = async (data: any) => {
        try {
            setAdding(true);
            setError('');
            await api.post('/budget', {
                category: data.category,
                percentage: Number(data.percentage),
                month: selectedMonth
            });
            reset();
            loadBudgets(selectedMonth);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save budget. Please check monthly income.');
        } finally {
            setAdding(false);
        }
    };

    const deleteBudget = async (id: number) => {
        try {
            await api.delete(`/budget/${id}`);
            loadBudgets(selectedMonth);
        } catch (err) {
            console.error(err);
        }
    };

    const totalAllocatedPct = budgets.reduce((sum, b) => sum + b.percentage, 0);

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Budget Allocation</h1>
                    <p className="text-gray-400">Allocate your income using the zero-based percentage method</p>
                </div>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-surface border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
            </div>

            {totalAllocatedPct > 100 && (
                <div className="bg-warning/20 border border-warning/50 text-warning px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Warning: You have allocated {totalAllocatedPct}% of your income. It exceeds 100%.</p>
                </div>
            )}

            {intelligence?.budget_intelligence && (
                <div className="glass-card p-6 border-l-4 border-l-accent relative overflow-hidden group shadow-lg">
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-2 rounded-lg bg-accent/20 text-accent">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white text-lg">AI Budget Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                        {intelligence.budget_intelligence.map((rec, i) => (
                            <div key={i} className="bg-surface/50 border border-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-gray-200">{rec.category}</h4>
                                    <span className="text-accent font-bold">{rec.percentage}%</span>
                                </div>
                                <p className="text-xl font-bold text-white mb-2">{formatCurrency(rec.amount)}</p>
                                <p className="text-xs text-gray-400">{rec.suggestion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-card p-6 lg:col-span-1 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Add Category</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                            <select
                                id="category"
                                {...register('category', { required: true })}
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="">Select Category...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="percentage" className="block text-sm font-medium text-gray-300 mb-2">Percentage (%)</label>
                            <input
                                id="percentage"
                                {...register('percentage', { required: true })}
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="100"
                                placeholder="20"
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={adding}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Budget Allocation'}
                        </button>
                    </form>
                </div>

                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Current Allocations</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Total Allocated</p>
                            <p className={`text-xl font-bold ${totalAllocatedPct > 100 ? 'text-danger' : totalAllocatedPct === 100 ? 'text-success' : 'text-white'}`}>
                                {totalAllocatedPct}%
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                            <PieChart className="w-12 h-12 mb-3 opacity-20" />
                            <p>No budgets recorded for {selectedMonth}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map((b) => (
                                <div key={b.id} className="group flex flex-col p-4 rounded-xl bg-surface hover:bg-white/5 transition-all border border-white/5 relative overflow-hidden">
                                    {/* Background progress bar indicator */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-white/5 pointer-events-none"
                                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                    />

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="w-1/3 font-medium text-white">{b.category}</div>
                                        <div className="w-1/3 text-center text-gray-400">{b.percentage}%</div>
                                        <div className="w-1/3 text-right flex justify-between items-center pl-4">
                                            <span className="font-bold text-accent">{formatCurrency(b.allocated_amount)}</span>
                                            <button
                                                onClick={() => deleteBudget(b.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};
