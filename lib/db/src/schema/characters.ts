import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const charactersTable = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  emoji: text("emoji").notNull(),
  color: text("color").notNull(),
  traits: text("traits").array().notNull().default([]),
  description: text("description").notNull(),
  teaches: text("teaches").notNull(),
});

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({ id: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;
