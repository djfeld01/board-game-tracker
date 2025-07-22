import { db } from "@/lib/db";
import { boardGames, weeklyRecommendations, gamePlays } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { startOfWeek } from "date-fns";

export async function generateWeeklyRecommendations(householdId: string) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  
  // Check if recommendations already exist for this week
  const existingRecommendations = await db
    .select()
    .from(weeklyRecommendations)
    .where(
      and(
        eq(weeklyRecommendations.householdId, householdId),
        eq(weeklyRecommendations.weekStart, weekStart)
      )
    )
    .limit(1);

  if (existingRecommendations.length > 0) {
    return existingRecommendations[0];
  }

  // Get all games for the household
  const allGames = await db
    .select()
    .from(boardGames)
    .where(eq(boardGames.householdId, householdId));

  if (allGames.length < 2) {
    throw new Error("Need at least 2 games in collection to generate recommendations");
  }

  // Get recently played games (last 4 weeks) to avoid recommending them
  const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
  const recentlyPlayed = await db
    .selectDistinct({ gameId: gamePlays.gameId })
    .from(gamePlays)
    .where(
      and(
        eq(gamePlays.householdId, householdId),
        sql`${gamePlays.playDate} >= ${fourWeeksAgo}`
      )
    );

  const recentlyPlayedIds = recentlyPlayed.map(p => p.gameId);
  
  // Filter out recently played games
  const availableGames = recentlyPlayedIds.length > 0 
    ? allGames.filter(game => !recentlyPlayedIds.includes(game.id))
    : allGames;

  // If we filtered out too many games, use all games
  const gamesToChooseFrom = availableGames.length >= 2 ? availableGames : allGames;

  // Randomly select 2 games
  const shuffled = gamesToChooseFrom.sort(() => 0.5 - Math.random());
  const selectedGames = shuffled.slice(0, 2);

  // Create the recommendation
  const recommendation = await db
    .insert(weeklyRecommendations)
    .values({
      householdId,
      weekStart,
      game1Id: selectedGames[0].id,
      game2Id: selectedGames[1].id,
    })
    .returning();

  return recommendation[0];
}

export async function getWeeklyRecommendations(householdId: string, weekStart?: Date) {
  const targetWeek = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
  
  const recommendations = await db
    .select({
      id: weeklyRecommendations.id,
      weekStart: weeklyRecommendations.weekStart,
      selectedGameId: weeklyRecommendations.selectedGameId,
      wasPlayed: weeklyRecommendations.wasPlayed,
      game1: {
        id: sql`g1.id`,
        name: sql`g1.name`,
        imageUrl: sql`g1.image_url`,
        minPlayers: sql`g1.min_players`,
        maxPlayers: sql`g1.max_players`,
        playingTime: sql`g1.playing_time`,
        complexity: sql`g1.complexity`,
      },
      game2: {
        id: sql`g2.id`,
        name: sql`g2.name`,
        imageUrl: sql`g2.image_url`,
        minPlayers: sql`g2.min_players`,
        maxPlayers: sql`g2.max_players`,
        playingTime: sql`g2.playing_time`,
        complexity: sql`g2.complexity`,
      },
    })
    .from(weeklyRecommendations)
    .leftJoin(sql`${boardGames} as g1`, sql`g1.id = ${weeklyRecommendations.game1Id}`)
    .leftJoin(sql`${boardGames} as g2`, sql`g2.id = ${weeklyRecommendations.game2Id}`)
    .where(
      and(
        eq(weeklyRecommendations.householdId, householdId),
        eq(weeklyRecommendations.weekStart, targetWeek)
      )
    )
    .limit(1);

  return recommendations[0] || null;
}

export async function selectWeeklyGame(recommendationId: string, gameId: string) {
  const updated = await db
    .update(weeklyRecommendations)
    .set({
      selectedGameId: gameId,
    })
    .where(eq(weeklyRecommendations.id, recommendationId))
    .returning();

  return updated[0];
}

export async function markWeeklyGameAsPlayed(recommendationId: string, playId: string) {
  const updated = await db
    .update(weeklyRecommendations)
    .set({
      wasPlayed: true,
      playId,
    })
    .where(eq(weeklyRecommendations.id, recommendationId))
    .returning();

  return updated[0];
}
