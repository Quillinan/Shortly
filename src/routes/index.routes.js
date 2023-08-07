import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema } from "../schemas/users.schema.js";
import { usersController } from "../controllers/users.controller.js";
import { loginSchema } from "../schemas/login.schema.js";

const router = Router();

router.get("/", (_, res) => {
  res.send("Shortly vive!!");
});

router.post("/signup", validateSchema(userSchema), usersController.Signup);
router.post("/signin", validateSchema(loginSchema), usersController.Signin);

export default router;
