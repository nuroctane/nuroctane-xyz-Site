import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import modkeysRouter from "./modkeys";
import booksRouter from "./books";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(modkeysRouter);
router.use(booksRouter);

export default router;
