import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/db";
import { TransactionType } from "@/app/generated/prisma/enums";
import type { User } from "@/app/generated/prisma/client";
import { sampleDashboardData } from "./sample";
import type {
    CategorySlice,
    DashboardData,
    TransactionRow,
    TrendPoint,
} from "./types";

/** Coerce a Prisma Decimal | number | null into a finite JS number. */
function toNum(value: unknown): number {
    if (value == null) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const maybe = value as { toNumber?: () => number };
    if (typeof maybe.toNumber === "function") return maybe.toNumber();
    const n = Number(value as string);
    return Number.isFinite(n) ? n : 0;
}

function pctChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return (current - previous) / previous;
}

export async function getDashboardData(): Promise<DashboardData> {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId || !process.env.DATABASE_URL) return sampleDashboardData();

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return sampleDashboardData();

        const data = await loadDashboardData(user);

        return data.accounts.length === 0 && data.transactions.length === 0
            ? sampleDashboardData()
            : data;
    } catch (error) {
        console.error("[dashboard] falling back to sample data:", error);
        return sampleDashboardData();
    }
}

async function loadDashboardData(user: User): Promise<DashboardData> {
    const userId = user.id;
    const currency = user.currency;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [accounts, monthTxs, prevMonthTxs, trendTxs, budgets, goals, notifItems, unread] =
        await Promise.all([
            prisma.account.findMany({ where: { userId }, orderBy: { balance: "desc" } }),
            prisma.transaction.findMany({
                where: { userId, transactionDate: { gte: monthStart } },
                include: { account: true, category: true },
                orderBy: { transactionDate: "desc" },
            }),
            prisma.transaction.findMany({
                where: { userId, transactionDate: { gte: prevMonthStart, lt: monthStart } },
                select: { amount: true, type: true },
            }),
            prisma.transaction.findMany({
                where: { userId, transactionDate: { gte: trendStart } },
                select: { amount: true, type: true, transactionDate: true },
            }),
            prisma.budget.findMany({
                where: { userId, endDate: { gte: now } },
                include: { category: true },
                orderBy: { endDate: "asc" },
            }),
            prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 4 }),
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

    const sumByType = (
        txs: { amount: unknown; type: TransactionType }[],
        type: TransactionType,
    ) => txs.reduce((acc, t) => (t.type === type ? acc + toNum(t.amount) : acc), 0);

    const income = sumByType(monthTxs, TransactionType.INCOME);
    const expense = sumByType(monthTxs, TransactionType.EXPENSE);
    const prevIncome = sumByType(prevMonthTxs, TransactionType.INCOME);
    const prevExpense = sumByType(prevMonthTxs, TransactionType.EXPENSE);
    const netWorth = accounts.reduce((acc, a) => acc + toNum(a.balance), 0);
    const netSavings = income - expense;
    const savingsRate = income > 0 ? netSavings / income : 0;

    // Category breakdown — current-month expenses grouped by category.
    const catMap = new Map<string, CategorySlice>();
    let categoryTotal = 0;
    for (const t of monthTxs) {
        if (t.type !== TransactionType.EXPENSE) continue;
        const amount = toNum(t.amount);
        categoryTotal += amount;
        const id = t.category?.id ?? "uncategorized";
        const existing = catMap.get(id);
        if (existing) {
            existing.amount += amount;
        } else {
            catMap.set(id, {
                id,
                name: t.category?.name ?? "Uncategorized",
                color: t.category?.color ?? null,
                icon: t.category?.icon ?? null,
                amount,
                pct: 0,
            });
        }
    }
    const categories = [...catMap.values()]
        .map((c) => ({ ...c, pct: categoryTotal > 0 ? c.amount / categoryTotal : 0 }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // 12-month income/expense trend, bucketed in JS for type-safety.
    const trend: TrendPoint[] = [];
    const buckets = new Map<string, { income: number; expense: number }>();
    for (let i = 0; i < 12; i++) {
        const d = new Date(trendStart.getFullYear(), trendStart.getMonth() + i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        buckets.set(key, { income: 0, expense: 0 });
        trend.push({
            label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(d),
            income: 0,
            expense: 0,
        });
    }
    for (const t of trendTxs) {
        const d = new Date(t.transactionDate);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const bucket = buckets.get(key);
        if (!bucket) continue;
        if (t.type === TransactionType.INCOME) bucket.income += toNum(t.amount);
        else if (t.type === TransactionType.EXPENSE) bucket.expense += toNum(t.amount);
    }
    [...buckets.values()].forEach((b, i) => {
        trend[i].income = b.income;
        trend[i].expense = b.expense;
    });

    // Budget spend — sum current-month expenses for each budget's category.
    const budgetRows = budgets.map((b) => {
        const amount = toNum(b.amount);
        const spent = monthTxs.reduce(
            (acc, t) =>
                t.type === TransactionType.EXPENSE && t.categoryId === b.categoryId
                    ? acc + toNum(t.amount)
                    : acc,
            0,
        );
        return {
            id: b.id,
            categoryName: b.category?.name ?? "General",
            period: b.period,
            amount,
            spent,
            pct: amount > 0 ? spent / amount : 0,
        };
    });

    const transactions: TransactionRow[] = monthTxs.slice(0, 6).map((t) => ({
        id: t.id,
        title: t.title,
        accountName: t.account.name,
        categoryName: t.category?.name ?? null,
        amount: toNum(t.amount),
        type: t.type,
        date: t.transactionDate.toISOString(),
    }));

    const goalRows = goals.map((g) => {
        const target = toNum(g.targetAmount);
        const current = toNum(g.currentAmount);
        return {
            id: g.id,
            title: g.title,
            targetAmount: target,
            currentAmount: current,
            pct: target > 0 ? current / target : 0,
            status: g.status,
            targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        };
    });

    // Health score: weighted blend of savings rate (0-60) and budget
    // adherence (0-40), clamped to 0-100.
    const overBudget = budgetRows.filter((b) => b.pct > 1).length;
    const adherence = budgetRows.length > 0 ? 1 - overBudget / budgetRows.length : 1;
    const healthScore = Math.round(
        Math.min(100, Math.max(0, savingsRate * 60 + adherence * 40)),
    );

    return {
        user: { name: user.username || "Operator", currency },
        kpi: {
            netWorth,
            income,
            expense,
            netSavings,
            savingsRate,
            incomeDeltaPct: pctChange(income, prevIncome),
            expenseDeltaPct: pctChange(expense, prevExpense),
            healthScore,
        },
        trend,
        categories,
        transactions,
        budgets: budgetRows,
        goals: goalRows,
        accounts: accounts.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            balance: toNum(a.balance),
            currency: a.currency,
        })),
        notifications: {
            unread,
            items: notifItems.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: n.isRead,
                createdAt: n.createdAt.toISOString(),
            })),
        },
        isSample: false,
    };
}
