import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { api } from '../services/api';
import { formatCurrency } from '../utils/utils';
import { Wallet, Plus, Trash2, Loader2, BrainCircuit, ArrowRight, X } from 'lucide-react';
import { Advisor } from '../components/Advisor';

interface Income {
    id: number;
    amount: number;
    month: string;
    source: string;
}

export const IncomePage = () => {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showAdvisor, setShowAdvisor] = useState(false);
    const hasIncome = incomes.length > 0;

    const { register, handleSubmit, reset } = useForm();

    const loadIncomes = async () => {
        try {
            const res = await api.get('/income');
            setIncomes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIncomes();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            setAdding(true);
            await api.post('/income', {
                amount: Number(data.amount),
                month: data.month,
                source: data.source || 'Salary'
            });
            reset();
            loadIncomes();
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const deleteIncome = async (id: number) => {
        try {
            await api.delete(`/income/${id}`);
            loadIncomes();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Income Management</h1>
                    <p className="text-gray-400">Track your monthly earnings to set accurate budgets</p>
                </div>
            </div>

            {/* AI Advisor Contextual Integration */}
            {showAdvisor ? (
                <div className="mb-8 relative">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowAdvisor(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:text-white"
                        >
                            <X className="w-4 h-4" /> Close Advisor
                        </button>
                    </div>
                    <div className="bg-surface/30 backdrop-blur-sm rounded-3xl p-2 border border-white/5 shadow-2xl">
                        <Advisor />
                    </div>
                </div>
            ) : (
                <div className="glass-card mb-8 p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all border border-[rgba(34,211,238,0.3)] bg-[linear-gradient(120deg,rgba(30,30,60,0.8),rgba(10,10,25,0.8))] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">AI Financial Advisor</h2>
                            <p className="text-gray-300">Let our AI build a custom budget and investment strategy based on your income and goals.</p>
                            {!hasIncome && (
                                <p className="text-sm text-cyan-400 mt-1 font-medium italic">Please add your monthly income to generate AI insights.</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => hasIncome && setShowAdvisor(true)}
                        disabled={!hasIncome}
                        className={`relative z-10 whitespace-nowrap font-medium py-3 px-6 rounded-xl border transition-all flex items-center gap-2 ${hasIncome
                            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-white border-cyan-500/30 hover:border-cyan-500/50 cursor-pointer'
                            : 'bg-white/5 text-gray-500 border-white/5 cursor-not-allowed'
                            }`}
                    >
                        {hasIncome ? 'Launch Advisor' : 'Income Required'}
                        {hasIncome && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="glass-card p-6 lg:col-span-1 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Plus className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Add Income</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                            <input
                                id="month"
                                {...register('month', { required: true })}
                                type="month"
                                defaultValue={format(new Date(), 'yyyy-MM')}
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
                            <input
                                id="amount"
                                {...register('amount', { required: true })}
                                type="number"
                                step="0.01"
                                min="1"
                                placeholder="50000"
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                            <input
                                id="source"
                                {...register('source')}
                                type="text"
                                placeholder="Salary, Freelance, etc."
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={adding}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                        >
                            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Income'}
                        </button>
                    </form>
                </div>

                {/* History List */}
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Income History</h2>
                    </div>

                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : incomes.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                            <Wallet className="w-12 h-12 mb-3 opacity-20" />
                            <p>No income records found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {incomes.map((inc) => (
                                <div key={inc.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                            ₹
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-lg">{formatCurrency(inc.amount)}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{inc.month}</span>
                                                <span>{inc.source}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteIncome(inc.id)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};
