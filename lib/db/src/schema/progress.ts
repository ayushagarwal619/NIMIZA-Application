import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const progressTable = pgTable("progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  storyId: uuid("story_id").notNull(),
  storyTitle: text("story_title").notNull(),
  badgeEmoji: text("badge_emoji").notNull(),
  badgeName: text("badge_name").notNull(),
  quizScore: integer("quiz_score").notNull().default(0),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progressTable).omit({ id: true, completedAt: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progressTable.$inferSelect;
