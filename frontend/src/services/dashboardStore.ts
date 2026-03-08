import { create } from 'zustand';
import { api } from '../services/api';

interface DashboardData {
    income: number;
    total_spent: number;
    total_allocated: number;
    remaining: number;
    savings_rate: number;
    behavior_cluster: string;
    category_spending: { category: string; spent: number }[];
    budgets: { category: string; percentage: number; allocated: number }[];
    trend: { month: string; income: number; spent: number }[];
}

export interface Subscription {
    service_name: string;
    billing_type: string;
    latest_amount: number;
    monthly_cost: number;
    yearly_cost: number;
    confidence_score: string;
}

export interface IntelligenceSummary {
    cash_flow_prediction: string;
    subscription_summary: string;
    habit_spending: string;
    hidden_spending: string;
    monthly_financial_story: string;
    budget_intelligence: { category: string; percentage: number; amount: number; suggestion: string }[];
    investment_insight: string;
    emergency_fund_risk: string;
}

interface DashboardState {
    data: DashboardData | null;
    subscriptions: Subscription[];
    intelligence: IntelligenceSummary | null;
    isLoading: boolean;
    error: string | null;
    fetchDashboard: (month: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    data: null,
    subscriptions: [],
    intelligence: null,
    isLoading: true,
    error: null,
    fetchDashboard: async (month: string) => {
        set({ isLoading: true, error: null });
        try {
            const [dashRes, subRes, intelRes] = await Promise.all([
                api.get(`/insights/dashboard-summary?month=${month}`),
                api.get(`/insights/subscriptions`),
                api.get(`/insights/engine?month=${month}`)
            ]);
            set({ data: dashRes.data, subscriptions: subRes.data, intelligence: intelRes.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.detail || 'Failed to load dashboard', isLoading: false });
        }
    },
}));
