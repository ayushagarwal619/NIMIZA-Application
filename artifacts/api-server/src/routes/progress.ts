import { Router, type IRouter } from "express";
import { db, progressTable, storiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { userId = "guest" } = req.query;

  const completed = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, String(userId)))
    .orderBy(progressTable.completedAt);

  const xp = completed.reduce((acc, p) => acc + (p.quizScore * 10) + 50, 0);
  const level = Math.floor(xp / 200) + 1;
  const streak = Math.min(completed.length, 7);

  const badges = completed.map(p => ({
    emoji: p.badgeEmoji,
    name: p.badgeName,
  }));

  const recentlyLearned = completed.slice(-5).map(p => p.storyTitle);

  res.json({
    userId,
    xp,
    level,
    streak,
    badges,
    completedStories: completed.map(p => ({
      ...p,
      completedAt: p.completedAt.toISOString(),
    })),
    recentlyLearned,
  });
});

router.post("/", async (req, res) => {
  const { userId = "guest", storyId, quizScore } = req.body;

  const storyRows = await db.select().from(storiesTable).where(eq(storiesTable.id, storyId));
  if (!storyRows[0]) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const story = storyRows[0];
  const [entry] = await db
    .insert(progressTable)
    .values({
      userId,
      storyId,
      storyTitle: story.title,
      badgeEmoji: story.badgeEmoji,
      badgeName: story.badgeName,
      quizScore,
    })
    .returning();

  res.status(201).json({
    ...entry,
    completedAt: entry.completedAt.toISOString(),
  });
});

export default router;
