import { Router, type IRouter } from "express";
import { db, storiesTable, scenesTable, quizQuestionsTable, charactersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { characterId, skill, ageGroup } = req.query;

  const stories = await db.select({
    id: storiesTable.id,
    title: storiesTable.title,
    emoji: storiesTable.emoji,
    description: storiesTable.description,
    characterId: storiesTable.characterId,
    characterName: charactersTable.name,
    characterEmoji: charactersTable.emoji,
    skill: storiesTable.skill,
    ageGroup: storiesTable.ageGroup,
    duration: storiesTable.duration,
    badgeEmoji: storiesTable.badgeEmoji,
    badgeName: storiesTable.badgeName,
  })
  .from(storiesTable)
  .leftJoin(charactersTable, eq(storiesTable.characterId, charactersTable.id));

  let filtered = stories;
  if (characterId) filtered = filtered.filter(s => s.characterId === characterId);
  if (skill) filtered = filtered.filter(s => s.skill === skill);
  if (ageGroup) filtered = filtered.filter(s => s.ageGroup === ageGroup);

  res.json(filtered.map(s => ({
    ...s,
    characterName: s.characterName ?? "",
    characterEmoji: s.characterEmoji ?? "",
  })));
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const storyRows = await db.select({
    id: storiesTable.id,
    title: storiesTable.title,
    emoji: storiesTable.emoji,
    description: storiesTable.description,
    characterId: storiesTable.characterId,
    characterName: charactersTable.name,
    characterEmoji: charactersTable.emoji,
    skill: storiesTable.skill,
    ageGroup: storiesTable.ageGroup,
    duration: storiesTable.duration,
    badgeEmoji: storiesTable.badgeEmoji,
    badgeName: storiesTable.badgeName,
  })
  .from(storiesTable)
  .leftJoin(charactersTable, eq(storiesTable.characterId, charactersTable.id))
  .where(eq(storiesTable.id, id));

  if (!storyRows[0]) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const scenes = await db.select().from(scenesTable).where(eq(scenesTable.storyId, id)).orderBy(scenesTable.order);
  const quiz = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.storyId, id));

  const story = storyRows[0];
  res.json({
    ...story,
    characterName: story.characterName ?? "",
    characterEmoji: story.characterEmoji ?? "",
    scenes,
    quiz,
  });
});

router.post("/", async (req, res) => {
  const { title, emoji, description, characterId, skill, ageGroup, duration, badgeEmoji, badgeName } = req.body;
  const [story] = await db
    .insert(storiesTable)
    .values({ title, emoji, description, characterId, skill, ageGroup, duration, badgeEmoji, badgeName })
    .returning();
  res.status(201).json(story);
});

export default router;
