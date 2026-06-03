import { getDashboardData } from "@/app/lib/dashboard/data";
import { Reveal } from "./_components/motion-primitives";
import { Topbar } from "./_components/topbar";
import { StatusBar } from "./_components/status-bar";
import { KpiCards } from "./_components/kpi-cards";
import { SpendingTrend } from "./_components/spending-trend";
import { CategoryBreakdown } from "./_components/category-breakdown";
import { RecentTransactions } from "./_components/recent-transactions";
import { Budgets } from "./_components/budgets";
import { SavingsGoals } from "./_components/savings-goals";
import { Accounts } from "./_components/accounts";
import { Notifications } from "./_components/notifications";

// The route is per-user and reads auth() + the DB at request time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const data = await getDashboardData();
    const { currency } = data.user;

    return (
        <div className="flex min-h-screen flex-col">
            <Topbar title={data.user.name} unread={data.notifications.unread} />

            <div className="flex-1 space-y-4 p-4 lg:p-6">
                {/* KPI strip */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_1.4fr]">
                    <KpiCards kpi={data.kpi} currency={currency} />
                </section>

                {/* Primary grid: 2/3 analytics + 1/3 ledger rail */}
                <section className="grid gap-4 xl:grid-cols-3">
                    <div className="space-y-4 xl:col-span-2">
                        <Reveal>
                            <SpendingTrend trend={data.trend} currency={currency} />
                        </Reveal>

                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <Reveal delay={0.05}>
                                <CategoryBreakdown categories={data.categories} currency={currency} />
                            </Reveal>
                            <Reveal delay={0.1}>
                                <Accounts accounts={data.accounts} />
                            </Reveal>
                        </div>

                        <Reveal delay={0.05}>
                            <RecentTransactions transactions={data.transactions} currency={currency} />
                        </Reveal>
                    </div>

                    {/* Right rail */}
                    <div className="space-y-4">
                        <Reveal>
                            <Budgets budgets={data.budgets} currency={currency} />
                        </Reveal>
                        <Reveal delay={0.05}>
                            <SavingsGoals goals={data.goals} currency={currency} />
                        </Reveal>
                        <Reveal delay={0.1}>
                            <Notifications
                                unread={data.notifications.unread}
                                items={data.notifications.items}
                            />
                        </Reveal>
                    </div>
                </section>
            </div>

            <StatusBar isSample={data.isSample} />
        </div>
    );
}
