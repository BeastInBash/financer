"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    Wallet,
    LineChart,
    Bot,
    FileText,
    Settings,
    Plus,
    CircleUser,
    CircleHelp,
    type LucideIcon,
} from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { label: "Expenses", href: "/expenses", icon: Wallet },
    { label: "Analytics", href: "/analytics", icon: LineChart },
    { label: "AI Advisor", href: "/ai-advisor", icon: Bot },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
];

const FOOTER_ITEMS: NavItem[] = [
    { label: "Profile", href: "/profile", icon: CircleUser },
    { label: "Support", href: "/support", icon: CircleHelp },
];

function isActive(pathname: string, href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        // Tablet (<lg) collapses to a 64px icon rail; desktop is the full 280px column.
        <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-outline-variant bg-surface-low lg:w-[280px]">
            {/* Brand */}
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-outline-variant lg:justify-start lg:px-6">
                <span className="font-sans text-xl font-bold tracking-tight text-on-surface lg:hidden">
                    F
                </span>
                <div className="hidden lg:block" >
                    <Link href={'/'}>
                        <h1 className="font-sans text-xl font-bold leading-none tracking-tight text-on-surface">
                            FINANCER
                        </h1>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
                            Finance Manager
                        </p>
                    </Link>
                </div>
            </div>

            {/* Primary navigation */}
            <nav className="flex-1 overflow-y-auto px-2 py-5 lg:px-3">
                <p className="mb-3 hidden px-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-outline lg:block">
                    Core Interface
                </p>
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.href}>
                            <NavLink item={item} active={isActive(pathname, item.href)} />
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="shrink-0 space-y-2 border-t border-outline-variant p-2 lg:p-3">
                <Link
                    href="/entry/new"
                    title="New Entry"
                    className="flex h-10 items-center justify-center gap-2 bg-ink font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-white transition-colors hover:bg-accent"
                >
                    <Plus size={16} strokeWidth={2} />
                    <span className="hidden lg:inline">New Entry</span>
                </Link>
                <ul className="space-y-1">
                    {FOOTER_ITEMS.map((item) => (
                        <li key={item.href}>
                            <NavLink item={item} active={isActive(pathname, item.href)} />
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            title={item.label}
            aria-current={active ? "page" : undefined}
            className={[
                "flex h-10 items-center justify-center gap-3 px-0 font-sans text-sm font-medium transition-colors lg:justify-start lg:px-3",
                active
                    ? "bg-accent text-on-accent"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
            ].join(" ")}
        >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            <span className="hidden lg:inline">{item.label}</span>
        </Link>
    );
}
