import { Router, type IRouter } from "express";
import healthRouter from "./health";
import charactersRouter from "./characters";
import storiesRouter from "./stories";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/characters", charactersRouter);
router.use("/stories", storiesRouter);
router.use("/progress", progressRouter);

export default router;
