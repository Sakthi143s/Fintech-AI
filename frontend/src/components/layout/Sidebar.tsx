import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    PieChart,
    TrendingUp,
    Lightbulb,
    Activity,
    LogOut
} from 'lucide-react';
import { useAuthStore } from '../../services/authStore';
import { cn } from '../../utils/utils';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: Wallet },
    { name: 'Budget', path: '/budget', icon: PieChart },
    { name: 'Expenses', path: '/expenses', icon: TrendingUp },
    { name: 'Investments', path: '/investments', icon: Activity },
    { name: 'Insights', path: '/insights', icon: Lightbulb },
];

export const Sidebar = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="w-64 h-screen bg-surface/30 backdrop-blur-2xl border-r border-white/5 flex flex-col p-5 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 mb-10 px-2 mt-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] transition-shadow duration-300">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-colors duration-300">FinAI Planner</h1>
            </div>

            <div className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-white bg-white/10 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )
                        }
                    >
                        {({ isActive }) => {
                            const Icon = item.icon;
                            return (
                                <>
                                    <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-primary scale-110" : "text-gray-400 group-hover:text-white group-hover:scale-110")} />
                                    <span className={cn("font-medium transition-transform duration-300", !isActive && "group-hover:translate-x-1")}>{item.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </>
                            );
                        }}
                    </NavLink>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="px-3 py-3 rounded-xl bg-white/5 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
