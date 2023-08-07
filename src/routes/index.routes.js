import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema } from "../schemas/users.schema.js";
import { usersController } from "../controllers/users.controller.js";
import { loginSchema } from "../schemas/login.schema.js";

import urlsRouter from "./urls.routes.js";
import usersRouter from "./users.routes.js";
import { urlsController } from "../controllers/urls.controller.js";

const router = Router();

router.get("/", (_, res) => {
  res.send("Shortly vive!!");
});

router.post("/signup", validateSchema(userSchema), usersController.signup);
router.post("/signin", validateSchema(loginSchema), usersController.signin);

router.use("/urls", urlsRouter);
router.use("/users", usersRouter);

router.get("/ranking", urlsController.getRanking);

export default router;
