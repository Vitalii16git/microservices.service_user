import { Router } from "express";
import { roleRoutes } from "./role.routes";

const router = Router();

roleRoutes.forEach((route) => {
  const { method, url, validator, middleware, controller } = route;

  (router.route(url) as any)[method](validator, middleware, controller);
});

export default router;
