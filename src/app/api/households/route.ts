import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { households, householdMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Household name is required" },
        { status: 400 }
      );
    }

    // Check if user is already in a household
    const existingMembership = await db
      .select()
      .from(householdMembers)
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    if (existingMembership.length > 0) {
      return NextResponse.json(
        { error: "User is already a member of a household" },
        { status: 409 }
      );
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create household
    const [newHousehold] = await db
      .insert(households)
      .values({
        name: name.trim(),
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

    return NextResponse.json({ household: newHousehold }, { status: 201 });
  } catch (error) {
    console.error("Error creating household:", error);
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
      .select({
        household: households,
        membership: householdMembers,
      })
      .from(householdMembers)
      .innerJoin(households, eq(householdMembers.householdId, households.id))
      .where(eq(householdMembers.userId, session.user.id))
      .limit(1);

    if (userHouseholds.length === 0) {
      return NextResponse.json({ household: null });
    }

    return NextResponse.json({ 
      household: userHouseholds[0].household,
      membership: userHouseholds[0].membership,
    });
  } catch (error) {
    console.error("Error fetching household:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
