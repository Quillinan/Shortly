import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  res.send("Shortly vive!!");
});

export default router;
