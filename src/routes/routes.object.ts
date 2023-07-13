import userController from "../controllers/user.controller";
import roleController from "../controllers/role.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { emailVerificatedMiddleware } from "../middlewares/email.verificated.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

export const routes = {
  userRoutes: [
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
      middleware: [authMiddleware, roleMiddleware("getUser")],
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
      middleware: [authMiddleware, roleMiddleware("updateUser")],
      controller: userController.updateUser,
    },
    {
      method: "delete",
      routeName: "deleteUser",
      url: "/delete/:id",
      validator: [],
      middleware: [authMiddleware, roleMiddleware("updateUser")],
      controller: userController.deleteUser,
    },

    {
      method: "post",
      routeName: "checkRedis", // function for testing redis
      url: "/checkRedis",
      validator: [],
      middleware: [],
      controller: userController.checkRedis,
    },
  ],
  roleRoutes: [
    {
      method: "post",
      routeName: "createRole",
      url: "/create",
      validator: [],
      middleware: [authMiddleware, roleMiddleware("createRole")],
      controller: roleController.createRole,
    },
    {
      method: "get",
      routeName: "getRoles",
      url: "/list",
      validator: [],
      middleware: [authMiddleware, roleMiddleware("getRoles")],
      controller: roleController.getRoles,
    },
    {
      method: "get",
      routeName: "getRole",
      url: "/:id",
      validator: [],
      middleware: [authMiddleware, roleMiddleware("getRole")],
      controller: roleController.getRole,
    },
    {
      method: "put",
      routeName: "updateRole",
      url: "/update/:id",
      validator: [],
      middleware: [authMiddleware, roleMiddleware("updateRole")],
      controller: roleController.updateRole,
    },
    {
      method: "delete",
      routeName: "deleteRole",
      url: "/delete/:id",
      validator: [],
      middleware: [authMiddleware, roleMiddleware("deleteRole")],
      controller: roleController.deleteRole,
    },
  ],
};
