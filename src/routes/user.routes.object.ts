import userController from "../controllers/user.controller.ts";

const routes = [
  {
    method: "post",
    routeName: "Register",
    url: "/register",
    validator: [],
    middleware: [],
    controller: userController.register,
  },
  {
    method: "post",
    routeName: "Login",
    url: "/login",
    validator: [],
    middleware: [],
    controller: userController.login,
  },
  {
    method: "get",
    routeName: "GetUsers",
    url: "/getUsers",
    validator: [],
    middleware: [],
    controller: userController.getUsers,
  },
  {
    method: "get",
    routeName: "GetUser",
    url: "/getUser",
    validator: [],
    middleware: [],
    controller: userController.getUser,
  },
];

export default routes;
