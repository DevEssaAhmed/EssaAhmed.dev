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
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
                    className="w-20 h-20 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center"
                >
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Something went wrong
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        An unexpected error occurred. Don&apos;t worry, you can try again or
                        head back home.
                    </p>
                </div>

                {process.env.NODE_ENV === "development" && error?.message && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-left">
                        <p className="text-sm font-mono text-destructive break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        onClick={reset}
                        className="bg-gradient-primary hover:shadow-glow transition-all duration-300 w-full sm:w-auto"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
