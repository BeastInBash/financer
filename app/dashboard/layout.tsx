import { Sidebar } from "@/app/components/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen bg-surface font-sans text-on-surface">
            <Sidebar />
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
