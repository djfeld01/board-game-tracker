CREATE TABLE "board_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"min_players" integer NOT NULL,
	"max_players" integer NOT NULL,
	"playing_time" integer,
	"complexity" numeric(3, 2),
	"year" integer,
	"publisher" text,
	"designer" text,
	"image_url" text,
	"bgg_id" integer,
	"is_expansion" boolean DEFAULT false,
	"base_game_id" uuid,
	"notes" text,
	"acquisition_date" timestamp,
	"price" numeric(10, 2),
	"condition" text,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_play_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"play_id" uuid NOT NULL,
	"user_id" uuid,
	"player_name" text NOT NULL,
	"score" integer,
	"position" integer,
	"is_winner" boolean DEFAULT false,
	"team_name" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "game_plays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"household_id" uuid NOT NULL,
	"play_date" timestamp NOT NULL,
	"duration" integer,
	"notes" text,
	"location" text,
	"is_team_game" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 1,
	"estimated_price" numeric(10, 2),
	"bgg_id" integer,
	"notes" text,
	"added_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_members" (
	"household_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "household_members_household_id_user_id_pk" PRIMARY KEY("household_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"invite_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "households_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weekly_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"week_start" timestamp NOT NULL,
	"game1_id" uuid NOT NULL,
	"game2_id" uuid NOT NULL,
	"selected_game_id" uuid,
	"was_played" boolean DEFAULT false,
	"play_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "board_games" ADD CONSTRAINT "board_games_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_play_participants" ADD CONSTRAINT "game_play_participants_play_id_game_plays_id_fk" FOREIGN KEY ("play_id") REFERENCES "public"."game_plays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_play_participants" ADD CONSTRAINT "game_play_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_plays" ADD CONSTRAINT "game_plays_game_id_board_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."board_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_plays" ADD CONSTRAINT "game_plays_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_wishlists" ADD CONSTRAINT "game_wishlists_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_wishlists" ADD CONSTRAINT "game_wishlists_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_recommendations" ADD CONSTRAINT "weekly_recommendations_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_recommendations" ADD CONSTRAINT "weekly_recommendations_game1_id_board_games_id_fk" FOREIGN KEY ("game1_id") REFERENCES "public"."board_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_recommendations" ADD CONSTRAINT "weekly_recommendations_game2_id_board_games_id_fk" FOREIGN KEY ("game2_id") REFERENCES "public"."board_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_recommendations" ADD CONSTRAINT "weekly_recommendations_selected_game_id_board_games_id_fk" FOREIGN KEY ("selected_game_id") REFERENCES "public"."board_games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_recommendations" ADD CONSTRAINT "weekly_recommendations_play_id_game_plays_id_fk" FOREIGN KEY ("play_id") REFERENCES "public"."game_plays"("id") ON DELETE no action ON UPDATE no action;