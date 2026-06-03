/**
 * Serializable view-models for the dashboard. These are plain objects (no
 * Prisma Decimal/Date instances) so they cross the server → client boundary
 * cleanly. Enum types are reused from the generated Prisma client to stay in
 * lockstep with `schema.prisma`.
 */
import type {
    AccountType,
    TransactionType,
    BudgetPeriod,
    GoalStatus,
    NotificationType,
} from "@/app/generated/prisma/enums";

export interface KpiData {
    /** Sum of all account balances. */
    netWorth: number;
    /** Current calendar-month income / expense totals. */
    income: number;
    expense: number;
    netSavings: number;
    /** 0..1 — share of income retained. */
    savingsRate: number;
    /** Month-over-month change as a fraction (0.042 = +4.2%), null when no baseline. */
    incomeDeltaPct: number | null;
    expenseDeltaPct: number | null;
    /** Composite 0..100 health score derived from savings rate + budget adherence. */
    healthScore: number;
}

export interface TrendPoint {
    label: string;
    income: number;
    expense: number;
}

export interface CategorySlice {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    amount: number;
    /** Share of total spend, 0..1. */
    pct: number;
}

export interface TransactionRow {
    id: string;
    title: string;
    accountName: string;
    categoryName: string | null;
    amount: number;
    type: TransactionType;
    /** ISO date string. */
    date: string;
}

export interface BudgetRow {
    id: string;
    categoryName: string;
    period: BudgetPeriod;
    amount: number;
    spent: number;
    /** spent / amount, 0..1 (may exceed 1 when over budget). */
    pct: number;
}

export interface GoalRow {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    /** 0..1. */
    pct: number;
    status: GoalStatus;
    targetDate: string | null;
}

export interface AccountRow {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
}

export interface NotificationRow {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
}

export interface DashboardData {
    user: { name: string; currency: string };
    kpi: KpiData;
    trend: TrendPoint[];
    categories: CategorySlice[];
    transactions: TransactionRow[];
    budgets: BudgetRow[];
    goals: GoalRow[];
    accounts: AccountRow[];
    notifications: { unread: number; items: NotificationRow[] };
    /** True when the live DB had no data and a demo dataset is being shown. */
    isSample: boolean;
}
