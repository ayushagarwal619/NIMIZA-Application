import { pgTable, text, uuid, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storiesTable = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description").notNull(),
  characterId: uuid("character_id").notNull(),
  skill: text("skill").notNull(),
  ageGroup: text("age_group").notNull(),
  duration: integer("duration").notNull().default(5),
  badgeEmoji: text("badge_emoji").notNull(),
  badgeName: text("badge_name").notNull(),
});

export const scenesTable = pgTable("scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id").notNull(),
  order: integer("order").notNull(),
  emoji: text("emoji").notNull(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  character: text("character").notNull(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  storyId: uuid("story_id").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull().default([]),
  correctIndex: integer("correct_index").notNull(),
});

export const insertStorySchema = createInsertSchema(storiesTable).omit({ id: true });
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;

export const insertSceneSchema = createInsertSchema(scenesTable).omit({ id: true });
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type Scene = typeof scenesTable.$inferSelect;

export const insertQuizQuestionSchema = createInsertSchema(quizQuestionsTable).omit({ id: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
