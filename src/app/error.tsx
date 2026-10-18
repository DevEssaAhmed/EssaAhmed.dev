"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center space-y-6"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto rounded-2xl bg-surface-container border border-champagne/30 flex items-center justify-center"
                >
                    <AlertTriangle className="w-10 h-10 text-champagne" />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-bold text-white">
                        Something went wrong
                    </h1>
                    <p className="text-ink-soft text-lg font-sans">
                        An unexpected error occurred. Don&apos;t worry, you can try again or
                        head back home.
                    </p>
                </div>

                {process.env.NODE_ENV === "development" && error?.message && (
                    <div className="p-4 rounded-xl bg-surface-low border border-border text-left">
                        <p className="text-sm font-mono text-champagne-dim break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        onClick={reset}
                        className="bg-champagne text-surface-lowest hover:bg-champagne/90 font-medium rounded-xl px-6 h-11 w-full sm:w-auto transition-all duration-200"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl px-6 h-11 border border-border bg-surface-container text-platinum hover:bg-surface-high transition-all duration-200 font-mono text-xs">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2 text-champagne" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
