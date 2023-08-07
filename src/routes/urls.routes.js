import { Router } from "express";
import { validateToken } from "../middlewares/validateToken.middleware.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { urlSchema } from "../schemas/urls.schema.js";
import { urlsController } from "../controllers/urls.controller.js";

const urlsRouter = Router();

// Rota para criar uma nova URL
urlsRouter.post(
  "/shorten",
  validateToken(),
  validateSchema(urlSchema),
  urlsController.Shorten
);

export default urlsRouter;
