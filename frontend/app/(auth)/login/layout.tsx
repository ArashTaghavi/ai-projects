import type { ReactNode } from "react";
import PublicSurface from "@/components/background/PublicSurface";

export default function LoginLayout({ children }: { children: ReactNode }) {
    return <PublicSurface>{children}</PublicSurface>;
}
