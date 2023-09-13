import { Router } from "express";
import { userRoutes } from "./user.routes";

const router = Router();

userRoutes.forEach((route) => {
  const { method, url, validator, middleware, controller } = route;

  (router.route(url) as any)[method](validator, middleware, controller);
});

export default router;
