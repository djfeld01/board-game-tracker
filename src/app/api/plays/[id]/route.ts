import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { gamePlays, gamePlayParticipants, householdMembers } from "@/lib/db/schema";
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

    const { playDate, duration, notes, participants } = await request.json();
    const playId = params.id;

    // Get user's household
    const userHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    if (userHouseholds.length === 0) {
      return NextResponse.json({ error: "No household found" }, { status: 404 });
    }

    const householdId = userHouseholds[0].householdId;

    // Verify the play belongs to this household
    const existingPlay = await db
      .select()
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.id, playId),
          eq(gamePlays.householdId, householdId)
        )
      );

    if (existingPlay.length === 0) {
      return NextResponse.json(
        { error: "Play not found or access denied" },
        { status: 404 }
      );
    }

    // Update the play record
    const [updatedPlay] = await db
      .update(gamePlays)
      .set({
        playDate: new Date(playDate),
        duration: duration || null,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(gamePlays.id, playId))
      .returning();

    // Delete existing participants
    await db
      .delete(gamePlayParticipants)
      .where(eq(gamePlayParticipants.playId, playId));

    // Add updated participants if provided
    if (participants && participants.length > 0) {
      const participantValues = participants.map((participant: { name: string; score?: number | null; position?: number | null; isWinner?: boolean }) => ({
        playId: playId,
        playerName: participant.name,
        score: participant.score || null,
        position: participant.position || null,
        isWinner: participant.isWinner || false,
      }));

      await db
        .insert(gamePlayParticipants)
        .values(participantValues);
    }

    return NextResponse.json({ play: updatedPlay });
  } catch (error) {
    console.error("Error updating play:", error);
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

    const playId = params.id;

    // Get user's household
    const userHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    if (userHouseholds.length === 0) {
      return NextResponse.json({ error: "No household found" }, { status: 404 });
    }

    const householdId = userHouseholds[0].householdId;

    // Verify the play belongs to this household
    const existingPlay = await db
      .select()
      .from(gamePlays)
      .where(
        and(
          eq(gamePlays.id, playId),
          eq(gamePlays.householdId, householdId)
        )
      );

    if (existingPlay.length === 0) {
      return NextResponse.json(
        { error: "Play not found or access denied" },
        { status: 404 }
      );
    }

    // Delete participants first (due to foreign key constraint)
    await db
      .delete(gamePlayParticipants)
      .where(eq(gamePlayParticipants.playId, playId));

    // Delete the play
    await db
      .delete(gamePlays)
      .where(eq(gamePlays.id, playId));

    return NextResponse.json({ message: "Play deleted successfully" });
  } catch (error) {
    console.error("Error deleting play:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
