import { roleMiddleware } from "../middlewares/role.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { emailVerificatedMiddleware } from "../middlewares/email.verificated.middleware";
import userController from "../controllers/user.controller";
import { IRoutes } from "../utils/interfaces";
import { validate } from "../middlewares/validate.middleware";
import { userRegisterValidation } from "../utils/validation.schemas";

export const userRoutes: IRoutes[] = [
  {
    method: "post",
    routeName: "register",
    url: "/register",
    validator: [],
    middleware: [validate(userRegisterValidation)],
    controller: userController.register,
  },
  {
    method: "post",
    routeName: "login",
    url: "/login",
    validator: [],
    middleware: [emailVerificatedMiddleware],
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
    middleware: [authMiddleware, roleMiddleware(["users:reed"])],
    controller: userController.getUser,
  },
  {
    method: "put",
    routeName: "emailVerification",
    url: "/verification/:id",
    validator: [],
    middleware: [],
    controller: userController.emailVerification,
  },
  {
    method: "put",
    routeName: "updateUser",
    url: "/update/:id",
    validator: [],
    middleware: [authMiddleware],
    controller: userController.updateUser,
  },
  {
    method: "delete",
    routeName: "deleteUser",
    url: "/delete/:id",
    validator: [],
    middleware: [authMiddleware],
    controller: userController.deleteUser,
  },
];
