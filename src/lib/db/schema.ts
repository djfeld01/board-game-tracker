import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Households table
export const households = pgTable("households", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Household members junction table
export const householdMembers = pgTable(
  "household_members",
  {
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "member"] }).notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.householdId, table.userId] }),
  })
);

// Board games table
export const boardGames = pgTable("board_games", {
  id: uuid("id").defaultRandom().primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  playingTime: integer("playing_time"), // in minutes
  complexity: decimal("complexity", { precision: 3, scale: 2 }), // 1.00 to 5.00
  year: integer("year"),
  publisher: text("publisher"),
  designer: text("designer"),
  imageUrl: text("image_url"),
  bggId: integer("bgg_id"), // BoardGameGeek ID if available
  isExpansion: boolean("is_expansion").default(false),
  baseGameId: uuid("base_game_id"), // Will add reference after table creation
  notes: text("notes"),
  acquisitionDate: timestamp("acquisition_date"),
  price: decimal("price", { precision: 10, scale: 2 }),
  condition: text("condition", { enum: ["new", "like_new", "good", "fair", "poor"] }),
  location: text("location"), // where it's stored
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game plays table
export const gamePlays = pgTable("game_plays", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => boardGames.id, { onDelete: "cascade" }),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  playDate: timestamp("play_date").notNull(),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  location: text("location"), // where the game was played
  isTeamGame: boolean("is_team_game").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Game play participants table
export const gamePlayParticipants = pgTable("game_play_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  playId: uuid("play_id")
    .notNull()
    .references(() => gamePlays.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }), // optional - for registered users
  playerName: text("player_name").notNull(), // for both registered and guest players
  score: integer("score"),
  position: integer("position"), // finishing position (1st, 2nd, etc.)
  isWinner: boolean("is_winner").default(false),
  teamName: text("team_name"), // for team games
  notes: text("notes"),
});

// Game wishlists
export const gameWishlists = pgTable("game_wishlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  priority: integer("priority").default(1), // 1-5 scale
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  bggId: integer("bgg_id"),
  notes: text("notes"),
  addedBy: uuid("added_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weekly game recommendations
export const weeklyRecommendations = pgTable("weekly_recommendations", {
  id: uuid("id").defaultRandom().primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start").notNull(),
  game1Id: uuid("game1_id")
    .notNull()
    .references(() => boardGames.id),
  game2Id: uuid("game2_id")
    .notNull()
    .references(() => boardGames.id),
  selectedGameId: uuid("selected_game_id").references(() => boardGames.id),
  wasPlayed: boolean("was_played").default(false),
  playId: uuid("play_id").references(() => gamePlays.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  householdMembers: many(householdMembers),
  gamePlayParticipants: many(gamePlayParticipants),
  gameWishlists: many(gameWishlists),
}));

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  boardGames: many(boardGames),
  gamePlays: many(gamePlays),
  gameWishlists: many(gameWishlists),
  weeklyRecommendations: many(weeklyRecommendations),
}));

export const householdMembersRelations = relations(householdMembers, ({ one }) => ({
  household: one(households, {
    fields: [householdMembers.householdId],
    references: [households.id],
  }),
  user: one(users, {
    fields: [householdMembers.userId],
    references: [users.id],
  }),
}));

export const boardGamesRelations = relations(boardGames, ({ one, many }) => ({
  household: one(households, {
    fields: [boardGames.householdId],
    references: [households.id],
  }),
  baseGame: one(boardGames, {
    fields: [boardGames.baseGameId],
    references: [boardGames.id],
  }),
  expansions: many(boardGames),
  gamePlays: many(gamePlays),
}));

export const gamePlaysRelations = relations(gamePlays, ({ one, many }) => ({
  game: one(boardGames, {
    fields: [gamePlays.gameId],
    references: [boardGames.id],
  }),
  household: one(households, {
    fields: [gamePlays.householdId],
    references: [households.id],
  }),
  participants: many(gamePlayParticipants),
}));

export const gamePlayParticipantsRelations = relations(gamePlayParticipants, ({ one }) => ({
  play: one(gamePlays, {
    fields: [gamePlayParticipants.playId],
    references: [gamePlays.id],
  }),
  user: one(users, {
    fields: [gamePlayParticipants.userId],
    references: [users.id],
  }),
}));

export const gameWishlistsRelations = relations(gameWishlists, ({ one }) => ({
  household: one(households, {
    fields: [gameWishlists.householdId],
    references: [households.id],
  }),
  addedByUser: one(users, {
    fields: [gameWishlists.addedBy],
    references: [users.id],
  }),
}));

export const weeklyRecommendationsRelations = relations(weeklyRecommendations, ({ one }) => ({
  household: one(households, {
    fields: [weeklyRecommendations.householdId],
    references: [households.id],
  }),
  game1: one(boardGames, {
    fields: [weeklyRecommendations.game1Id],
    references: [boardGames.id],
  }),
  game2: one(boardGames, {
    fields: [weeklyRecommendations.game2Id],
    references: [boardGames.id],
  }),
  selectedGame: one(boardGames, {
    fields: [weeklyRecommendations.selectedGameId],
    references: [boardGames.id],
  }),
  play: one(gamePlays, {
    fields: [weeklyRecommendations.playId],
    references: [gamePlays.id],
  }),
}));
