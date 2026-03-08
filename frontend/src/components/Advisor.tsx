import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { api } from '../services/api';
import { Loader2, ArrowRight, BrainCircuit, Target, Briefcase, Home, Shield, Sparkles, TrendingUp, AlertTriangle, Activity, Coffee, CreditCard } from 'lucide-react';

const schema = yup.object({
    income: yup.number().typeError('Must be a number').positive('Must be positive').required('Income is required'),
    role: yup.string().required('Role is required'),
    lifestyle: yup.string().required('Lifestyle is required'),
    living_situation: yup.string().required('Living situation is required'),
    risk_tolerance: yup.string().required('Risk tolerance is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

interface Allocation {
    category: string;
    percentage: number;
    amount: number;
    suggestion: string;
}

interface AdvisorResponse {
    analysis: string;
    allocations: Allocation[];
    strategies: string[];
    wealth_estimation: {
        monthly_investment: number;
        rate: number;
        years: number;
        future_value: number;
    };
    friendly_advice: string;

    // New Intelligence Layer
    cash_flow_prediction: string;
    health_score: { score: number; grade: string; breakdown: any };
    financial_story: string;
    spending_personality: string;
    emergency_fund_risk: string;
    subscription_summary: string;
    habit_spending: string;
    hidden_spending: string;
}

export const Advisor = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AdvisorResponse | null>(null);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            setError('');
            const res = await api.post('/insights/advisor', data);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to generate advisor plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">AI Financial Advisor</h1>
                    <p className="text-gray-400">Get a hyper-personalized budget and wealth plan crafted just for you.</p>
                </div>
            </div>

            {!result ? (
                <div className="glass-card p-8 max-w-3xl mx-auto border-t-2 border-primary">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Income */}
                            <div className="space-y-2">
                                <label htmlFor="income" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Briefcase className="w-4 h-4 text-primary" /> Monthly Income (₹)
                                </label>
                                <input
                                    id="income"
                                    {...register('income')}
                                    type="number"
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="50000"
                                />
                                {errors.income && <p className="text-sm text-danger">{errors.income.message}</p>}
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label htmlFor="role" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Target className="w-4 h-4 text-accent" /> Current Role
                                </label>
                                <select
                                    id="role"
                                    {...register('role')}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                >
                                    <option value="">Select Role...</option>
                                    <option value="student">Student</option>
                                    <option value="working professional">Working Professional</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="business owner">Business Owner</option>
                                </select>
                                {errors.role && <p className="text-sm text-danger">{errors.role.message}</p>}
                            </div>

                            {/* Living Situation */}
                            <div className="space-y-2">
                                <label htmlFor="living_situation" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Home className="w-4 h-4 text-success" /> Living Situation
                                </label>
                                <select
                                    id="living_situation"
                                    {...register('living_situation')}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-success focus:border-transparent transition-all"
                                >
                                    <option value="">Select Situation...</option>
                                    <option value="with parents">With Parents</option>
                                    <option value="renting">Renting</option>
                                    <option value="hostel">Hostel</option>
                                    <option value="own house">Own House</option>
                                </select>
                                {errors.living_situation && <p className="text-sm text-danger">{errors.living_situation.message}</p>}
                            </div>

                            {/* Lifestyle */}
                            <div className="space-y-2">
                                <label htmlFor="lifestyle" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Sparkles className="w-4 h-4 text-warning" /> Lifestyle Preference
                                </label>
                                <select
                                    id="lifestyle"
                                    {...register('lifestyle')}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-warning focus:border-transparent transition-all"
                                >
                                    <option value="">Select Lifestyle...</option>
                                    <option value="minimal">Minimal (Frugal)</option>
                                    <option value="balanced">Balanced</option>
                                    <option value="luxury">Luxury (High Comfort)</option>
                                </select>
                                {errors.lifestyle && <p className="text-sm text-danger">{errors.lifestyle.message}</p>}
                            </div>

                            {/* Risk Tolerance */}
                            <div className="space-y-2">
                                <label htmlFor="risk_tolerance" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Shield className="w-4 h-4 text-danger" /> Investment Risk Tolerance
                                </label>
                                <select
                                    id="risk_tolerance"
                                    {...register('risk_tolerance')}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-danger focus:border-transparent transition-all"
                                >
                                    <option value="">Select Risk Level...</option>
                                    <option value="low">Low (Safe, Fixed Returns)</option>
                                    <option value="moderate">Moderate (Balanced mutual funds)</option>
                                    <option value="high">High (Aggressive Equities/Crypto)</option>
                                </select>
                                {errors.risk_tolerance && <p className="text-sm text-danger">{errors.risk_tolerance.message}</p>}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium py-4 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Analyzing your Profile...
                                    </>
                                ) : (
                                    <>
                                        Generate AI Financial Plan
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6 max-w-5xl mx-auto">
                    {/* Header Controls */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setResult(null)}
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" /> Recalculate
                        </button>
                    </div>

                    {/* Friendly Advice Banner */}
                    <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-l-primary relative overflow-hidden space-y-4">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent" /> Your AI Financial Mentor
                        </h2>
                        <p className="text-gray-200 text-lg leading-relaxed relative z-10 italic">"{result.friendly_advice}"</p>
                        <div className="w-full h-px bg-white/10" />
                        <p className="text-gray-300 text-base leading-relaxed relative z-10"><strong>Your Monthly Story: </strong>{result.financial_story}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Health Score & Personality */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6 border border-white/5 flex flex-col items-center justify-center text-center">
                                <h3 className="text-lg font-bold text-gray-300 mb-4 tracking-tight">Financial Health Score</h3>
                                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-gray-700 mx-auto"
                                            strokeDasharray="100, 100"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            stroke="currentColor" strokeWidth="3" fill="none"
                                        />
                                        <path
                                            className={`${result.health_score.score >= 80 ? 'text-success' : result.health_score.score >= 50 ? 'text-warning' : 'text-danger'}`}
                                            strokeDasharray={`${result.health_score.score}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-3xl font-black text-white">{result.health_score.score}</span>
                                        <span className="text-xs text-gray-400 font-bold">Grade {result.health_score.grade}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">Calculated based on savings rate, expense control, and investments.</p>
                            </div>

                            <div className="glass-card p-6 border border-white/5 space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Behavior Profile</h3>
                                <p className="text-sm text-gray-300 bg-surface p-3 rounded-lg border border-white/5">{result.spending_personality}</p>

                                <h3 className="text-lg font-bold text-white flex items-center gap-2 pt-2"><AlertTriangle className="w-5 h-5 text-warning" /> Risk Analysis</h3>
                                <p className="text-sm text-gray-300 bg-surface p-3 rounded-lg border border-white/5">{result.emergency_fund_risk}</p>
                            </div>
                        </div>

                        {/* Allocations Breakdown */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold text-white mb-4">Recommended Budget Structure</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.allocations.map((alloc, idx) => (
                                    <div key={idx} className="glass-card p-5 border-t-2" style={{ borderTopColor: `hsl(${idx * 70 + 190}, 70%, 50%)` }}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-white text-lg">{alloc.category}</span>
                                            <span className="text-sm font-medium bg-white/10 px-2 py-1 rounded-md">{alloc.percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="text-2xl font-black mb-2 tracking-tight">
                                            ₹{alloc.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </div>
                                        <p className="text-xs text-gray-400">{alloc.suggestion}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tailored Strategies */}
                            <div className="glass-card p-6 border border-white/5 mt-6">
                                <h3 className="text-xl font-bold text-white mb-4">Tailored Strategies</h3>
                                <div className="space-y-3">
                                    {result.strategies.map((strat, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                                            <p className="text-gray-300">{strat}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Intelligence */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cash Flow & Habits */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4">Cash Flow & Habits Analysis</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass-card p-5 border border-primary/20 bg-primary/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Cash Flow Prediction</h4>
                                    </div>
                                    <p className="text-sm text-gray-300">{result.cash_flow_prediction}</p>
                                </div>

                                <div className="glass-card p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Coffee className="w-4 h-4 text-warning" />
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Habit Spending</h4>
                                    </div>
                                    <p className="text-sm text-gray-300">{result.habit_spending}</p>
                                </div>

                                <div className="glass-card p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="w-4 h-4 text-danger" />
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Hidden Spending</h4>
                                    </div>
                                    <p className="text-sm text-gray-300">{result.hidden_spending}</p>
                                </div>

                                <div className="glass-card p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-accent" />
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Subscriptions</h4>
                                    </div>
                                    <p className="text-sm text-gray-300">{result.subscription_summary}</p>
                                </div>
                            </div>

                        </div>

                        {/* Wealth Estimation */}
                        <div className="glass-card p-6 bg-surface/80 border border-success/20 h-fit">
                            <h3 className="text-xl font-bold text-white mb-6">10-Year Wealth Projection</h3>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Monthly Investment</p>
                                    <p className="text-2xl font-bold text-white">₹{result.wealth_estimation.monthly_investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Estimated Return Rate</p>
                                    <p className="text-2xl font-bold text-accent">{result.wealth_estimation.rate}% <span className="text-sm text-gray-500 font-normal">annual</span></p>
                                </div>

                                <div className="w-full h-px bg-white/10 my-4" />

                                <div>
                                    <p className="text-sm text-gray-300 font-medium mb-1">Projected Future Wealth</p>
                                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-success to-primary tracking-tight">
                                        ₹{result.wealth_estimation.future_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                        *This is an estimation based on compounding interest and your risk tolerance. Markets are subject to volatility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};
