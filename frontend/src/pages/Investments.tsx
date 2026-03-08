import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { api } from '../services/api';
import { formatCurrency } from '../utils/utils';
import { useDashboardStore } from '../services/dashboardStore';
import { Calculator, TrendingUp, Loader2, ArrowRight, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SIPResult {
    future_value: number;
    total_invested: number;
    total_returns: number;
}

export const InvestmentsPage = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SIPResult | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    const { intelligence, fetchDashboard } = useDashboardStore();

    useEffect(() => {
        fetchDashboard(format(new Date(), 'yyyy-MM'));
    }, [fetchDashboard]);

    const { register, handleSubmit } = useForm({
        defaultValues: {
            monthly_amount: 5000,
            rate: 12,
            years: 10
        }
    });

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const res = await api.post('/investments/calc/sip', {
                monthly_amount: Number(data.monthly_amount),
                rate: Number(data.rate),
                years: Number(data.years)
            });
            setResult(res.data);

            // Generate progressive chart data
            const points = [];
            const m = Number(data.monthly_amount);
            const r = Number(data.rate) / 100 / 12;
            const yrs = Number(data.years);

            for (let i = 1; i <= yrs; i++) {
                const months = i * 12;
                const invested = m * months;
                let value = invested;
                if (r > 0) {
                    value = m * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
                }
                points.push({
                    year: `Year ${i}`,
                    invested: Math.round(invested),
                    value: Math.round(value)
                });
            }
            setChartData(points);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Investment Calculator</h1>
                    <p className="text-gray-400">Plan your future wealth with compounding growth</p>
                </div>
            </div>

            {intelligence?.investment_insight && (
                <div className="bg-primary/20 border border-primary/50 text-white px-6 py-4 rounded-xl flex items-center gap-4 shadow-lg mb-8">
                    <div className="p-2 bg-primary/30 rounded-full flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-primary-200" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-1">AI Investment Insight</h4>
                        <p className="text-gray-300">{intelligence.investment_insight}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-card p-6 lg:col-span-1 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">SIP Calculator</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="monthly_amount" className="block text-sm font-medium text-gray-300 mb-2">Monthly Investment (₹)</label>
                            <input
                                id="monthly_amount"
                                {...register('monthly_amount', { required: true })}
                                type="number"
                                step="100"
                                min="100"
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-[border-color,box-shadow]"
                            />
                        </div>

                        <div>
                            <label htmlFor="rate" className="block text-sm font-medium text-gray-300 mb-2">Expected Return Rate (% p.a)</label>
                            <input
                                id="rate"
                                {...register('rate', { required: true })}
                                type="number"
                                step="0.1"
                                min="1"
                                max="100"
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-[border-color,box-shadow]"
                            />
                        </div>

                        <div>
                            <label htmlFor="years" className="block text-sm font-medium text-gray-300 mb-2">Time Period (Years)</label>
                            <input
                                id="years"
                                {...register('years', { required: true })}
                                type="number"
                                step="1"
                                min="1"
                                max="50"
                                className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-[border-color,box-shadow]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate ROI'}
                            {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <AnimatedPage className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-surface border border-white/5 shadow-lg">
                                    <p className="text-gray-400 mb-1 text-sm font-medium">Invested Amount</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(result.total_invested)}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-surface border border-white/5 shadow-lg">
                                    <p className="text-gray-400 mb-1 text-sm font-medium">Est. Returns</p>
                                    <p className="text-2xl font-bold text-success">+{formatCurrency(result.total_returns)}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shadow-lg shadow-primary/10">
                                    <p className="text-primary-100 mb-1 text-sm font-medium">Total Value</p>
                                    <p className="text-3xl font-bold text-white">{formatCurrency(result.future_value)}</p>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Wealth Growth Projection</h2>
                                </div>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                                            <XAxis dataKey="year" stroke="#9ca3af" tickLine={false} axisLine={false} />
                                            <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                            <Tooltip
                                                formatter={(value: any) => formatCurrency(value as number)}
                                                contentStyle={{ backgroundColor: '#181820', borderColor: '#ffffff1a', borderRadius: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="value" name="Future Value" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                            <Area type="monotone" dataKey="invested" name="Invested" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorInv)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </AnimatedPage>
                    ) : (
                        <div className="glass-card h-full flex flex-col items-center justify-center p-10 text-center border border-white/5 opacity-80">
                            <Calculator className="w-20 h-20 text-primary opacity-20 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Compound Growth Calculator</h3>
                            <p className="text-gray-400 max-w-sm">Enter your projected SIP details on the left to visualize how compounding interest accelerates wealth over time.</p>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};
