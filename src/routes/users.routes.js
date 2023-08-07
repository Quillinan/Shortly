import { Router } from "express";
import { usersController } from "../controllers/users.controller.js";
import { validateToken } from "../middlewares/validateToken.middleware.js";

const usersRouter = Router();

// Rota para obter URLs do usuario
usersRouter.get("/me", validateToken(), usersController.getUserUrls);

export default usersRouter;
