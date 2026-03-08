import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useDashboardStore } from '../services/dashboardStore';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { formatCurrency } from '../utils/utils';
import {
    Wallet,
    TrendingDown,
    PiggyBank,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Repeat
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    PieChart, Cell, Pie, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Fintech Colors: Blue (Income), Red (Spent), Teal (Savings), Green (Investments), Purple, Amber
const COLORS = ['#3B82F6', '#EF4444', '#14B8A6', '#10B981', '#A855F7', '#F59E0B'];

export const Dashboard = () => {
    const [currentMonth] = useState(format(new Date(), 'yyyy-MM'));
    const { data, subscriptions, intelligence, isLoading, fetchDashboard } = useDashboardStore();

    useEffect(() => {
        fetchDashboard(currentMonth);
    }, [currentMonth, fetchDashboard]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const budgetUsedPct = data.income > 0 ? (data.total_spent / data.income) * 100 : 0;

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Financial Overview</h1>
                    <p className="text-gray-400">Here{"'"}s what{"'"}s happening in {format(new Date(), 'MMMM yyyy')}</p>
                </div>
            </div>

            {/* AI Insight Widget */}
            {data.behavior_cluster && (
                <motion.div
                    className="relative overflow-hidden rounded-2xl bg-surface/80 backdrop-blur-2xl border border-secondary/40 shadow-[0_8px_32px_rgba(168,85,247,0.2)] p-6 mb-8 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-secondary/30 transition-colors duration-700" />
                    <div className="flex gap-5 items-start sm:items-center relative z-10 flex-col sm:flex-row">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        >
                            <Sparkles className="w-7 h-7 text-white" />
                        </motion.div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-white tracking-tight">AI Insights</h3>
                                <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.2)]">Smart Assistant</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                Based on your recent spending habits, our AI has identified your financial behavior as a <strong className="text-white font-bold px-1 rounded bg-white/10">&quot;{data.behavior_cluster}&quot;</strong> profile.
                                {data.behavior_cluster === 'High Spender' ? ' Consider reviewing recent large expenses to stay within your remaining budget limits.' : ' Keep up the great financial discipline this month!'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {intelligence && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {intelligence.cash_flow_prediction && (
                        <motion.div
                            className="glass-card p-6 border-l-4 border-l-success relative overflow-hidden group shadow-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="p-2 rounded-lg bg-success/20 text-success">
                                    <TrendingDown className="w-5 h-5 rotate-180" />
                                </div>
                                <h3 className="font-bold text-white text-lg">Cash Flow Prediction</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed relative z-10">{intelligence.cash_flow_prediction}</p>
                        </motion.div>
                    )}

                    {intelligence.monthly_financial_story && (
                        <motion.div
                            className="glass-card p-6 border-l-4 border-l-primary relative overflow-hidden group shadow-lg"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white text-lg">Monthly Synopsis</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed relative z-10">{intelligence.monthly_financial_story}</p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Top Stats */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, staggerChildren: 0.1 }}
            >
                {intelligence?.emergency_fund_risk && (
                    <div className={`lg:col-span-4 p-4 rounded-xl border ${intelligence.emergency_fund_risk.includes('(Green)') ? 'bg-success/10 border-success/30 text-success' :
                            intelligence.emergency_fund_risk.includes('(Yellow)') ? 'bg-warning/10 border-warning/30 text-warning' :
                                'bg-danger/10 border-danger/30 text-danger'
                        } flex items-center gap-3 shadow-md`}>
                        <Wallet className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium text-sm">
                            {intelligence.emergency_fund_risk.replace(/\(Green\)|\(Yellow\)|\(Red\)/gi, '')}
                        </p>
                    </div>
                )}
                {/* PRIMARY CARD 1: Monthly Income */}
                <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass-card p-6 relative overflow-hidden group shadow-[0_8px_32px_rgba(99,102,241,0.15)] border-primary/20 bg-surface/60"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors duration-500" />

                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Monthly Income</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-white relative z-10 tracking-tight">{formatCurrency(data.income)}</p>
                </motion.div>

                {/* SECONDARY CARD 1: Total Spent */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingDown className="w-24 h-24 text-danger" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Total Spent</h3>
                        </div>
                        <span className="text-xs font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {budgetUsedPct.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-100 relative z-10">{formatCurrency(data.total_spent)}</p>
                </motion.div>

                {/* PRIMARY CARD 2: Budget Remaining */}
                <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass-card p-6 relative overflow-hidden group shadow-[0_8px_32px_rgba(20,184,166,0.15)] border-accent/20 bg-surface/60"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-accent/20 rounded-full blur-2xl group-hover:bg-accent/30 transition-colors duration-500" />

                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-shadow">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Budget Remaining</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-white relative z-10 tracking-tight">{formatCurrency(data.remaining)}</p>
                </motion.div>

                {/* SECONDARY CARD 2: Savings Rate */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PiggyBank className="w-24 h-24 text-success" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                                <PiggyBank className="w-5 h-5" />
                            </div>
                            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Savings Rate</h3>
                        </div>
                        {data.savings_rate > 20 && (
                            <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <ArrowDownRight className="w-3 h-3" />
                                Good
                            </span>
                        )}
                    </div>
                    <p className="text-3xl font-bold text-gray-100 relative z-10">{data.savings_rate}%</p>
                </motion.div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {/* SVG Gradients for Recharts */}
                <svg style={{ width: 0, height: 0, position: 'absolute' }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Spending Breakdown */}
                <div className="glass-card p-6 lg:col-span-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Spending Breakdown</h3>
                    <div className="h-[300px] w-full">
                        {data.category_spending.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.category_spending}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="spent"
                                        nameKey="category"
                                        stroke="none"
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    >
                                        {data.category_spending.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value || 0))}
                                        contentStyle={{ backgroundColor: 'rgba(18,18,26,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No tracking data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* 6-Month Trend */}
                <div className="glass-card p-6 lg:col-span-2 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Income vs Spending Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value || 0))}
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: 'rgba(18,18,26,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="income" name="Income" fill="url(#colorIncome)" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                                <Bar dataKey="spent" name="Spent" fill="url(#colorSpent)" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>

            {/* Subscriptions Panel */}
            <motion.div
                className="glass-card p-6 border border-accent/20 bg-surface/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                        <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Detected Subscriptions</h2>
                        <p className="text-sm text-gray-400">Total Monthly Cost: <span className="font-bold text-white">{formatCurrency(subscriptions?.reduce((sum, s) => sum + s.monthly_cost, 0) || 0)}</span></p>
                    </div>
                </div>

                {subscriptions && subscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subscriptions.map((sub, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Repeat className="w-12 h-12 text-white" />
                                </div>
                                <div className="flex justify-between items-start relative z-10">
                                    <h3 className="text-white font-bold">{sub.service_name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${sub.confidence_score === 'high' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                        {sub.confidence_score} confidence
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-2 relative z-10">
                                    <div>
                                        <p className="text-xs text-gray-400 capitalize">{sub.billing_type} • Latest: {formatCurrency(sub.latest_amount)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-danger">-{formatCurrency(sub.monthly_cost)}</p>
                                        <p className="text-xs text-gray-400">/mo average</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
                        <Repeat className="w-10 h-10 mb-2 opacity-20" />
                        <p>No recurring subscriptions detected in the last 6 months.</p>
                    </div>
                )}
            </motion.div>
        </AnimatedPage>
    );
};
