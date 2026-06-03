export default function FrontLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen items-center justify-center overflow-hidden p-4">
            {children}
        </div>
    );
}
