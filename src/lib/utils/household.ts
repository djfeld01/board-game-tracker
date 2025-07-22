import { db } from "@/lib/db";
import { households, householdMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function createHousehold(name: string, ownerId: string) {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const newHousehold = await db.transaction(async (tx) => {
    const household = await tx
      .insert(households)
      .values({
        name,
        inviteCode,
      })
      .returning();

    await tx.insert(householdMembers).values({
      householdId: household[0].id,
      userId: ownerId,
      role: "owner",
    });

    return household[0];
  });

  return newHousehold;
}

export async function joinHousehold(inviteCode: string, userId: string) {
  const household = await db
    .select()
    .from(households)
    .where(eq(households.inviteCode, inviteCode))
    .limit(1);

  if (!household.length) {
    throw new Error("Invalid invite code");
  }

  // Check if user is already a member
  const existingMembership = await db
    .select()
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, household[0].id),
        eq(householdMembers.userId, userId)
      )
    )
    .limit(1);

  if (existingMembership.length > 0) {
    throw new Error("Already a member of this household");
  }

  await db.insert(householdMembers).values({
    householdId: household[0].id,
    userId,
    role: "member",
  });

  return household[0];
}

export async function getUserHouseholds(userId: string) {
  return await db
    .select({
      id: households.id,
      name: households.name,
      inviteCode: households.inviteCode,
      role: householdMembers.role,
      joinedAt: householdMembers.joinedAt,
    })
    .from(households)
    .innerJoin(householdMembers, eq(households.id, householdMembers.householdId))
    .where(eq(householdMembers.userId, userId));
}

export async function getHouseholdMembers(householdId: string) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: householdMembers.role,
      joinedAt: householdMembers.joinedAt,
    })
    .from(users)
    .innerJoin(householdMembers, eq(users.id, householdMembers.userId))
    .where(eq(householdMembers.householdId, householdId));
}
