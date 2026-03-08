import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../services/authStore';
import { useEffect } from 'react';

export const Layout = () => {
    const { user, token, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-[#0B0B0F] text-gray-100 overflow-hidden relative">
            {/* Base global background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[160px] opacity-70" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-secondary/10 rounded-full blur-[160px] opacity-70" />
                <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[140px] opacity-50" />
            </div>

            <div className="z-10 bg-transparent h-screen flex flex-col md:flex-row w-full">
                <Sidebar />
                <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden p-8 relative scroll-smooth">
                    <div className="relative z-10 max-w-6xl mx-auto h-full pb-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
