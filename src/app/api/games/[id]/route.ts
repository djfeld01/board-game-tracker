import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { boardGames, householdMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Session } from "next-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameId = params.id;
    const body = await request.json();

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

    // Update the game, ensuring it belongs to the user's household
    const [updatedGame] = await db
      .update(boardGames)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(boardGames.id, gameId),
          eq(boardGames.householdId, householdId)
        )
      )
      .returning();

    if (!updatedGame) {
      return NextResponse.json(
        { error: "Game not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameId = params.id;

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

    // Delete the game, ensuring it belongs to the user's household
    const [deletedGame] = await db
      .delete(boardGames)
      .where(
        and(
          eq(boardGames.id, gameId),
          eq(boardGames.householdId, householdId)
        )
      )
      .returning();

    if (!deletedGame) {
      return NextResponse.json(
        { error: "Game not found or not accessible" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
