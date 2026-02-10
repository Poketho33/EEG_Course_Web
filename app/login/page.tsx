"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

// example login page
export default function GitHubSignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "github",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Sign in with GitHub
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleGitHubSignIn}
          disabled={isLoading}
          className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {isLoading ? "Signing in..." : "Sign in with GitHub"}
        </button>
      </div>
    </div>
  );
}

