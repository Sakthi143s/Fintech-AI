import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { IncomePage } from './pages/Income';
import { BudgetPage } from './pages/Budget';
import { ExpensesPage } from './pages/Expenses';
import { InvestmentsPage } from './pages/Investments';
import { InsightsPage } from './pages/Insights';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="investments" element={<InvestmentsPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
