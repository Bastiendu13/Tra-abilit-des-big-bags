"use client";

import { UserProfileProvider } from "@/hooks/use-user-profile";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <UserProfileProvider>
            {children}
        </UserProfileProvider>
    );
}
