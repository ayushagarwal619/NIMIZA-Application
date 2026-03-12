import { Router, type IRouter } from "express";
import { db, charactersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const characters = await db.select().from(charactersTable).orderBy(charactersTable.name);
  res.json(characters);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const results = await db.select().from(charactersTable).where(eq(charactersTable.id, id));
  if (!results[0]) {
    res.status(404).json({ error: "Character not found" });
    return;
  }
  res.json(results[0]);
});

router.post("/", async (req, res) => {
  const { name, role, emoji, color, traits, description, teaches } = req.body;
  const [character] = await db
    .insert(charactersTable)
    .values({ name, role, emoji, color, traits, description, teaches })
    .returning();
  res.status(201).json(character);
});

export default router;
