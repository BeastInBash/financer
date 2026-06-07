"use client";

import { useState, type ReactNode } from "react";
import {
    QueryClient,
    QueryClientProvider,
    environmentManager,
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
    if (environmentManager.isServer()) {
        return makeQueryClient();
    }
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(getQueryClient);

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
