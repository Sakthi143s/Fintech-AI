import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AnimatedPage } from '../components/layout/AnimatedPage';
import { api } from '../services/api';
import { useDashboardStore } from '../services/dashboardStore';
import { Lightbulb, Activity, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface HealthScore {
    score: number;
    grade: string;
    breakdown: {
        [key: string]: { score: number; max: number; value: number };
    };
}

interface Insight {
    type: 'warning' | 'tip' | 'info';
    title: string;
    message: string;
}

export const InsightsPage = () => {
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState<HealthScore | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const { intelligence, fetchDashboard } = useDashboardStore();

    useEffect(() => {
        const loadData = async () => {
            fetchDashboard(selectedMonth);
            try {
                setLoading(true);
                const [healthRes, insightsRes] = await Promise.all([
                    api.get(`/insights/health-score?month=${selectedMonth}`),
                    api.get(`/insights/recommendations?month=${selectedMonth}`)
                ]);
                setHealth(healthRes.data);
                setInsights(insightsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedMonth, fetchDashboard]);

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-success border-success/30 bg-success/10 shadow-success/20';
            case 'B': return 'text-accent border-accent/30 bg-accent/10 shadow-accent/20';
            case 'C': return 'text-primary border-primary/30 bg-primary/10 shadow-primary/20';
            case 'D': return 'text-warning border-warning/30 bg-warning/10 shadow-warning/20';
            default: return 'text-danger border-danger/30 bg-danger/10 shadow-danger/20';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-6 h-6 text-warning" />;
            case 'tip': return <CheckCircle className="w-6 h-6 text-success" />;
            default: return <Info className="w-6 h-6 text-primary" />;
        }
    };

    return (
        <AnimatedPage className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">AI Financial Insights</h1>
                    <p className="text-gray-400">Intelligent analysis of your spending and saving habits</p>
                </div>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-surface border border-white/10 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Health Score Panel */}
                    <div className="glass-card p-6 lg:col-span-1 border-t-4 border-t-primary h-fit">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Financial Health</h2>
                        </div>

                        {health && (
                            <>
                                <div className="flex flex-col items-center justify-center mb-10">
                                    <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl ${getGradeColor(health.grade)}`}>
                                        <span className="text-5xl font-black">{health.score}</span>
                                        <span className="text-sm tracking-widest uppercase mt-1 opacity-80">Grade {health.grade}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(health.breakdown).map(([key, data]) => {
                                        const pct = (data.score / data.max) * 100;
                                        return (
                                            <div key={key}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-300 text-sm capitalize">
                                                        {key === 'spending_control' ? 'Expense Control' :
                                                            key === 'investment_activity' ? 'Investment Habit' :
                                                                key.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-white text-sm font-medium">{data.score}/{data.max}</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 text-right">Value: {data.value}%</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* AI Recommendations */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 border-t-4 border-t-accent">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Smart Recommendations</h2>
                            </div>

                            {insights.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No insights generated yet. Add income and expenses to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {insights.map((insight, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex gap-4 p-5 rounded-2xl border bg-surface/50 transition-all hover:-translate-y-1 ${insight.type === 'warning' ? 'border-warning/30 hover:shadow-warning/10 hover:shadow-lg' :
                                                insight.type === 'tip' ? 'border-success/30 hover:shadow-success/10 hover:shadow-lg' :
                                                    'border-primary/30 hover:shadow-primary/10 hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(insight.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{insight.title}</h3>
                                                <p className="text-gray-400 leading-relaxed">{insight.message}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Intelligence Engine Insights */}
                                    {intelligence?.habit_spending && (
                                        <div className="flex gap-4 p-5 rounded-2xl border bg-surface/50 transition-all hover:-translate-y-1 border-primary/30 hover:shadow-primary/10 hover:shadow-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                <Info className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">Spending Habits</h3>
                                                <p className="text-gray-400 leading-relaxed">{intelligence.habit_spending}</p>
                                            </div>
                                        </div>
                                    )}
                                    {intelligence?.hidden_spending && (
                                        <div className="flex gap-4 p-5 rounded-2xl border bg-surface/50 transition-all hover:-translate-y-1 border-warning/30 hover:shadow-warning/10 hover:shadow-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                <AlertTriangle className="w-6 h-6 text-warning" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">Hidden Spending</h3>
                                                <p className="text-gray-400 leading-relaxed">{intelligence.hidden_spending}</p>
                                            </div>
                                        </div>
                                    )}
                                    {intelligence?.subscription_summary && (
                                        <div className="flex gap-4 p-5 rounded-2xl border bg-surface/50 transition-all hover:-translate-y-1 border-accent/30 hover:shadow-accent/10 hover:shadow-lg">
                                            <div className="flex-shrink-0 mt-1">
                                                <Activity className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">Subscription Analysis</h3>
                                                <p className="text-gray-400 leading-relaxed">{intelligence.subscription_summary}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
};
