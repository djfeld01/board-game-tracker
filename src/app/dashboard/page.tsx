"use client";

import { AuthLayout } from "@/components/auth-layout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Trophy, Heart, Users, TrendingUp, Calendar, RefreshCw } from "lucide-react";

interface DashboardStats {
  totalGames: number;
  totalPlays: number;
  wishlistCount: number;
  householdMembers: number;
  recentPlays: Array<{
    id: string;
    gameName: string;
    playDate: string;
    duration: number;
  }>;
  topGames: Array<{
    id: string;
    name: string;
    playCount: number;
  }>;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback to mock data if API fails
        const mockStats: DashboardStats = {
          totalGames: 0,
          totalPlays: 0,
          wishlistCount: 0,
          householdMembers: 1,
          recentPlays: [],
          topGames: [],
        };
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data on error
      const mockStats: DashboardStats = {
        totalGames: 0,
        totalPlays: 0,
        wishlistCount: 0,
        householdMembers: 1,
        recentPlays: [],
        topGames: [],
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Add a focus event listener to refresh stats when user returns to the dashboard
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return (
      <AuthLayout>
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </AuthLayout>
    );
  }

  const statCards = [
    {
      name: "Games in Collection",
      value: stats?.totalGames || 0,
      icon: Gamepad2,
      color: "bg-blue-500",
      href: "/collection",
    },
    {
      name: "Total Plays",
      value: stats?.totalPlays || 0,
      icon: Trophy,
      color: "bg-green-500",
      href: "/plays",
    },
    {
      name: "Wishlist Items",
      value: stats?.wishlistCount || 0,
      icon: Heart,
      color: "bg-red-500",
      href: "/wishlist",
    },
    {
      name: "Household Members",
      value: stats?.householdMembers || 0,
      icon: Users,
      color: "bg-purple-500",
      href: "/household",
    },
  ];

  return (
    <AuthLayout>
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here&apos;s what&apos;s happening with your board game collection.
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardStats();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.name}
                href={card.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200 block cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${card.color} p-3 rounded-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {card.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Plays */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Plays
              </h3>
            </div>
            <div className="p-6">
              {stats?.recentPlays && stats.recentPlays.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentPlays.map((play) => (
                    <div key={play.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {play.gameName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(play.playDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {play.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No plays recorded yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start logging your game sessions!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Games */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Most Played Games
              </h3>
            </div>
            <div className="p-6">
              {stats?.topGames && stats.topGames.length > 0 ? (
                <div className="space-y-4">
                  {stats.topGames.map((game, index) => (
                    <div key={game.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-gray-900 ml-3">
                          {game.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {game.playCount} plays
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No games played yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add games to your collection and start playing!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
                <Gamepad2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-blue-900">Add Game</div>
              </button>
              <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-900">Log Play</div>
              </button>
              <button className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-center transition-colors">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-red-900">Add to Wishlist</div>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-purple-900">Invite Member</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
