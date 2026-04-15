"use client";

import { UserProfileProvider } from "@/hooks/use-user-profile";
import { SessionConfigProvider } from "@/hooks/use-session-config";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <UserProfileProvider>
            <SessionConfigProvider>
                {children}
            </SessionConfigProvider>
        </UserProfileProvider>
    );
}
