"use client";

import { useUser } from "@clerk/nextjs";

export const useCurrentUser = () => {
    const { isLoaded, isSignedIn, user } = useUser();

    return {
        user,
        isLoaded,
        isAuthenticated: isSignedIn ?? false,
    };
};
