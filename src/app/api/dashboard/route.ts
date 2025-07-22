import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { boardGames, householdMembers, gamePlays } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import type { Session } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's household
    const userHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    if (userHouseholds.length === 0) {
      // No household yet, return empty stats
      return NextResponse.json({
        totalGames: 0,
        totalPlays: 0,
        wishlistCount: 0,
        householdMembers: 0,
        recentPlays: [],
        topGames: [],
      });
    }

    const householdId = userHouseholds[0].householdId;

    // Get total games count
    const gamesCount = await db
      .select({ count: count() })
      .from(boardGames)
      .where(eq(boardGames.householdId, householdId));

    // Get total plays count
    const playsCount = await db
      .select({ count: count() })
      .from(gamePlays)
      .where(eq(gamePlays.householdId, householdId));

    // Get household members count
    const membersCount = await db
      .select({ count: count() })
      .from(householdMembers)
      .where(eq(householdMembers.householdId, householdId));

    // Get recent plays (last 5)
    const recentPlays = await db
      .select({
        id: gamePlays.id,
        gameName: boardGames.name,
        playDate: gamePlays.playDate,
        duration: gamePlays.duration,
      })
      .from(gamePlays)
      .leftJoin(boardGames, eq(gamePlays.gameId, boardGames.id))
      .where(eq(gamePlays.householdId, householdId))
      .orderBy(desc(gamePlays.playDate))
      .limit(5);

    // TODO: Implement wishlist count when wishlist functionality is added
    const wishlistCount = 0;

    // TODO: Implement top games when we have more play data
    const topGames: Array<{ id: string; name: string; playCount: number }> = [];

    return NextResponse.json({
      totalGames: gamesCount[0]?.count || 0,
      totalPlays: playsCount[0]?.count || 0,
      wishlistCount,
      householdMembers: membersCount[0]?.count || 0,
      recentPlays: recentPlays.map(play => ({
        id: play.id,
        gameName: play.gameName || 'Unknown Game',
        playDate: play.playDate?.toISOString() || new Date().toISOString(),
        duration: play.duration || 0,
      })),
      topGames,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
