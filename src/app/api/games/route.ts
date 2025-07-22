import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { boardGames, householdMembers, households } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      bggId,
      year,
      minPlayers,
      maxPlayers,
      playingTime,
      complexity,
      description,
      imageUrl,
      designer,
      publisher,
      condition = "good",
      location,
      notes,
      price,
    } = body;

    if (!name || !minPlayers || !maxPlayers) {
      return NextResponse.json(
        { error: "Name, minPlayers, and maxPlayers are required" },
        { status: 400 }
      );
    }

    // Get user's household
    const userHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    let householdId: string;

    if (userHouseholds.length === 0) {
      // Auto-create a household for the user if they don't have one
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const [newHousehold] = await db
        .insert(households)
        .values({
          name: `${session.user.name || session.user.email}'s Collection`,
          inviteCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Add user as owner member
      await db
        .insert(householdMembers)
        .values({
          householdId: newHousehold.id,
          userId: session.user.id,
          role: "owner",
          joinedAt: new Date(),
        });

      householdId = newHousehold.id;
    } else {
      householdId = userHouseholds[0].householdId;
    }

    // Check if game already exists in the household
    const existingGame = await db
      .select()
      .from(boardGames)
      .where(
        and(
          eq(boardGames.householdId, householdId),
          or(
            eq(boardGames.name, name),
            bggId ? eq(boardGames.bggId, bggId) : undefined
          )
        )
      )
      .limit(1);

    if (existingGame.length > 0) {
      return NextResponse.json(
        { error: "Game already exists in your collection" },
        { status: 409 }
      );
    }

    // Add the game to the collection
    const [newGame] = await db
      .insert(boardGames)
      .values({
        householdId,
        name,
        bggId: bggId || null,
        year: year || null,
        minPlayers,
        maxPlayers,
        playingTime: playingTime || null,
        complexity: complexity ? complexity.toString() : null,
        description: description || null,
        imageUrl: imageUrl || null,
        designer: designer || null,
        publisher: publisher || null,
        condition,
        location: location || null,
        notes: notes || null,
        price: price ? price.toString() : null,
        acquisitionDate: new Date(),
      })
      .returning();

    return NextResponse.json({ game: newGame }, { status: 201 });

    return NextResponse.json({ game: newGame }, { status: 201 });
  } catch (error) {
    console.error("Error adding game:", error);
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

    if (!userHouseholds.length) {
      return NextResponse.json([]);
    }

    const householdId = userHouseholds[0].householdId;

    // Get games for the household
    const games = await db
      .select()
      .from(boardGames)
      .where(eq(boardGames.householdId, householdId));

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
