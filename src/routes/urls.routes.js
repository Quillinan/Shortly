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
  urlsController.shorten
);

//Rota para obter URL pelo ID
urlsRouter.get("/:id", urlsController.getUrlById);

// Rota para redirecionar para URL original
urlsRouter.get("/open/:shortUrl", urlsController.openUrl);

export default urlsRouter;
