import userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { verifyCode } from "../middlewares/email.verificated";

const routes = [
  {
    method: "post",
    routeName: "register",
    url: "/register",
    validator: [],
    middleware: [],
    controller: userController.register,
  },
  {
    method: "post",
    routeName: "login",
    url: "/login",
    validator: [],
    middleware: verifyCode,
    controller: userController.login,
  },
  {
    method: "get",
    routeName: "getUsers",
    url: "/list",
    validator: [],
    middleware: [],
    controller: userController.getUsers,
  },
  {
    method: "get",
    routeName: "getUser",
    url: "/:id",
    validator: [],
    middleware: authMiddleware,
    controller: userController.getUser,
  },
  {
    method: "put",
    routeName: "emailVerification",
    url: "/verification/:id",
    validator: [],
    middleware: authMiddleware,
    controller: userController.emailVerification,
  },
  {
    method: "put",
    routeName: "updateUser",
    url: "/update/:id",
    validator: [],
    middleware: authMiddleware,
    controller: userController.updateUser,
  },
  {
    method: "delete",
    routeName: "deleteUser",
    url: "/delete/:id",
    validator: [],
    middleware: authMiddleware,
    controller: userController.deleteUser,
  },
];

export default routes;
