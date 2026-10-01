import { Hono } from "hono";
import healthRouter from "./health";
import authRouter from "./auth";
import modkeysRouter from "./modkeys";
import booksRouter from "./books";
import curriculumRouter from "./curriculum";
import githubContribRouter from "./github-contrib";
import nurCliVersionRouter from "./nur-cli-version";
import observatoryRouter from "./observatory";

const router = new Hono();

router.route("/", healthRouter);
router.route("/", nurCliVersionRouter);
router.route("/", authRouter);
router.route("/", modkeysRouter);
router.route("/", booksRouter);
router.route("/", curriculumRouter);
router.route("/", githubContribRouter);
router.route("/", observatoryRouter);

export default router;
