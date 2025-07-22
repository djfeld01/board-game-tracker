"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎲</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-8">🎲</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Board Game Tracker
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your board game collection, log your plays, and discover new favorites with your household.
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Account
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-6 text-left">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">📚 Collection Management</h3>
              <p className="text-sm text-gray-600">
                Keep track of all your board games with detailed information and photos.
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">🏆 Play Tracking</h3>
              <p className="text-sm text-gray-600">
                Log your game sessions, track winners, and see your gaming statistics.
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">🔀 Weekly Recommendations</h3>
              <p className="text-sm text-gray-600">
                Get random game suggestions to explore your collection and try new games.
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">👥 Household Sharing</h3>
              <p className="text-sm text-gray-600">
                Share your collection with family members and track group gaming sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
