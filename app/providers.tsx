"use client";

import { useState, type ReactNode } from "react";
import {
    QueryClient,
    QueryClientProvider,
    isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
    if (isServer) {
        return makeQueryClient();
    }
    // Browser: reuse one client across renders (and across React Suspense
    // remounts) so the cache is preserved.
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
    // Read the client once per component instance. We intentionally do NOT use
    // `useState(makeQueryClient)` directly so the browser singleton is shared.
    const [queryClient] = useState(getQueryClient);

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
