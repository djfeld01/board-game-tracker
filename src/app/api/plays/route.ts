import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { gamePlays, gamePlayParticipants, householdMembers, boardGames } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      gameId,
      playDate,
      duration,
      notes,
      participants = [],
    } = body;

    if (!gameId || !playDate) {
      return NextResponse.json(
        { error: "Game ID and play date are required" },
        { status: 400 }
      );
    }

    // Get user's household
    const userHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    if (userHouseholds.length === 0) {
      return NextResponse.json(
        { error: "User is not part of any household" },
        { status: 400 }
      );
    }

    const householdId = userHouseholds[0].householdId;

    // Verify the game belongs to the user's household
    const game = await db
      .select()
      .from(boardGames)
      .where(eq(boardGames.id, gameId))
      .limit(1);

    if (game.length === 0 || game[0].householdId !== householdId) {
      return NextResponse.json(
        { error: "Game not found or not accessible" },
        { status: 404 }
      );
    }

    // Create the play record
    const [newPlay] = await db
      .insert(gamePlays)
      .values({
        gameId,
        householdId,
        playDate: new Date(playDate),
        duration: duration || null,
        notes: notes || null,
        createdAt: new Date(),
      })
      .returning();

    // Add play participants if provided
    if (participants && participants.length > 0) {
      const participantValues = participants.map((participant: any) => ({
        playId: newPlay.id,
        playerName: participant.name,
        score: participant.score || null,
        position: participant.position || null,
        isWinner: participant.isWinner || false,
      }));

      await db
        .insert(gamePlayParticipants)
        .values(participantValues);
    }

    return NextResponse.json({ play: newPlay }, { status: 201 });
  } catch (error) {
    console.error("Error creating play:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ plays: [] });
    }

    const householdId = userHouseholds[0].householdId;

    // Get plays for the household with game information and participant counts
    const plays = await db
      .select({
        id: gamePlays.id,
        gameId: gamePlays.gameId,
        gameName: boardGames.name,
        gameImage: boardGames.imageUrl,
        playDate: gamePlays.playDate,
        duration: gamePlays.duration,
        notes: gamePlays.notes,
        createdAt: gamePlays.createdAt,
      })
      .from(gamePlays)
      .leftJoin(boardGames, eq(gamePlays.gameId, boardGames.id))
      .where(eq(gamePlays.householdId, householdId))
      .orderBy(desc(gamePlays.playDate));

    // Get participant details for each play
    const playsWithParticipants = await Promise.all(
      plays.map(async (play) => {
        const participants = await db
          .select({
            id: gamePlayParticipants.id,
            playerName: gamePlayParticipants.playerName,
            score: gamePlayParticipants.score,
            position: gamePlayParticipants.position,
            isWinner: gamePlayParticipants.isWinner,
          })
          .from(gamePlayParticipants)
          .where(eq(gamePlayParticipants.playId, play.id));
        
        return {
          ...play,
          participants,
          participantCount: participants.length,
        };
      })
    );

    return NextResponse.json({ plays: playsWithParticipants });
  } catch (error) {
    console.error("Error fetching plays:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
