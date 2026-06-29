import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teacherRouter from "./teacher";
import studentRouter from "./student";
import classRouter from "./class";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/teacher", teacherRouter);
router.use("/student", studentRouter);
router.use("/class", classRouter);

export default router;
