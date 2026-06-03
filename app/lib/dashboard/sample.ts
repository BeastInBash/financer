/**
 * Deterministic demo dataset. Shape-identical to what `loadDashboardData`
 * produces from Prisma, so the UI is exercised even without a seeded DB.
 */
import {
    AccountType,
    BudgetPeriod,
    GoalStatus,
    NotificationType,
    TransactionType,
} from "@/app/generated/prisma/enums";
import type { DashboardData } from "./types";

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const EXPENSE_SERIES = [6420, 7180, 6890, 8240, 7650, 9120, 8470, 7980, 9340, 8760, 10120, 10410];
const INCOME_SERIES = [11200, 11200, 11800, 11800, 12400, 12400, 12400, 13100, 13100, 13800, 13800, 14380];

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

export function sampleDashboardData(): DashboardData {
    const expense = EXPENSE_SERIES[EXPENSE_SERIES.length - 1];
    const income = INCOME_SERIES[INCOME_SERIES.length - 1];
    const prevExpense = EXPENSE_SERIES[EXPENSE_SERIES.length - 2];
    const prevIncome = INCOME_SERIES[INCOME_SERIES.length - 2];
    const netSavings = income - expense;

    return {
        user: { name: "Operator", currency: "USD" },
        kpi: {
            netWorth: 184_920.5,
            income,
            expense,
            netSavings,
            savingsRate: netSavings / income,
            incomeDeltaPct: (income - prevIncome) / prevIncome,
            expenseDeltaPct: (expense - prevExpense) / prevExpense,
            healthScore: 94,
        },
        trend: MONTHS.map((label, i) => ({
            label,
            income: INCOME_SERIES[i],
            expense: EXPENSE_SERIES[i],
        })),
        categories: [
            { id: "c1", name: "Operating Leases", color: "#ea580c", icon: null, amount: 4280, pct: 0.41 },
            { id: "c2", name: "SaaS & Licenses", color: "#171717", icon: null, amount: 2340, pct: 0.225 },
            { id: "c3", name: "Payroll", color: "#444748", icon: null, amount: 1890, pct: 0.182 },
            { id: "c4", name: "Logistics", color: "#747878", icon: null, amount: 980, pct: 0.094 },
            { id: "c5", name: "Utilities", color: "#c4c7c7", icon: null, amount: 620, pct: 0.06 },
        ],
        transactions: [
            { id: "t1", title: "Stripe Payout", accountName: "Operating · Bank", categoryName: "Revenue", amount: 8450, type: TransactionType.INCOME, date: daysAgo(0) },
            { id: "t2", title: "Amazon AWS", accountName: "Operating · Bank", categoryName: "SaaS & Licenses", amount: 1240, type: TransactionType.EXPENSE, date: daysAgo(1) },
            { id: "t3", title: "Deloitte Advisory", accountName: "Operating · Bank", categoryName: "Payroll", amount: 2100, type: TransactionType.EXPENSE, date: daysAgo(2) },
            { id: "t4", title: "Vault Transfer", accountName: "Reserve · Investment", categoryName: null, amount: 5000, type: TransactionType.TRANSFER, date: daysAgo(3) },
            { id: "t5", title: "Uber Central", accountName: "Corporate · Credit", categoryName: "Logistics", amount: 42.2, type: TransactionType.EXPENSE, date: daysAgo(4) },
            { id: "t6", title: "Figma Org", accountName: "Corporate · Credit", categoryName: "SaaS & Licenses", amount: 180, type: TransactionType.EXPENSE, date: daysAgo(5) },
        ],
        budgets: [
            { id: "b1", categoryName: "Operating Leases", period: BudgetPeriod.MONTHLY, amount: 5000, spent: 4280, pct: 0.856 },
            { id: "b2", categoryName: "SaaS & Licenses", period: BudgetPeriod.MONTHLY, amount: 2000, spent: 2340, pct: 1.17 },
            { id: "b3", categoryName: "Logistics", period: BudgetPeriod.MONTHLY, amount: 1500, spent: 980, pct: 0.653 },
        ],
        goals: [
            { id: "g1", title: "Operating Reserve", targetAmount: 100_000, currentAmount: 74_500, pct: 0.745, status: GoalStatus.ACTIVE, targetDate: daysAgo(-120) },
            { id: "g2", title: "Q4 Tax Provision", targetAmount: 40_000, currentAmount: 40_000, pct: 1, status: GoalStatus.COMPLETED, targetDate: daysAgo(-30) },
            { id: "g3", title: "Equipment Fund", targetAmount: 25_000, currentAmount: 9_200, pct: 0.368, status: GoalStatus.ACTIVE, targetDate: daysAgo(-200) },
        ],
        accounts: [
            { id: "a1", name: "Operating", type: AccountType.BANK, balance: 92_400.5, currency: "USD" },
            { id: "a2", name: "Reserve", type: AccountType.INVESTMENT, balance: 74_500, currency: "USD" },
            { id: "a3", name: "Corporate Card", type: AccountType.CREDIT_CARD, balance: -4_980, currency: "USD" },
            { id: "a4", name: "Petty Cash", type: AccountType.CASH, balance: 3_000, currency: "USD" },
        ],
        notifications: {
            unread: 3,
            items: [
                { id: "n1", title: "Budget exceeded", message: "SaaS & Licenses is 17% over the monthly cap.", type: NotificationType.BUDGET_ALERT, isRead: false, createdAt: daysAgo(0) },
                { id: "n2", title: "Goal completed", message: "Q4 Tax Provision reached 100% of target.", type: NotificationType.GOAL_COMPLETED, isRead: false, createdAt: daysAgo(1) },
                { id: "n3", title: "Recurring payment", message: "Datadog · $180 is scheduled for tomorrow.", type: NotificationType.RECURRING_PAYMENT, isRead: false, createdAt: daysAgo(1) },
                { id: "n4", title: "Monthly report", message: "Your November statement is ready to export.", type: NotificationType.MONTHLY_REPORT, isRead: true, createdAt: daysAgo(6) },
            ],
        },
        isSample: true,
    };
}
