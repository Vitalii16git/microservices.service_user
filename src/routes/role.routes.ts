import roleController from "../controllers/role.controller";

export const roleRoutes = [
  {
    method: "post",
    routeName: "createRole",
    url: "/create",
    validator: [],
    middleware: [],
    controller: roleController.createRole,
  },
  {
    method: "get",
    routeName: "getRoles",
    url: "/list",
    validator: [],
    middleware: [],
    controller: roleController.getRoles,
  },
  {
    method: "get",
    routeName: "getRole",
    url: "/:id",
    validator: [],
    middleware: [],
    controller: roleController.getRole,
  },
  {
    method: "put",
    routeName: "updateRole",
    url: "/update/:id",
    validator: [],
    middleware: [],
    controller: roleController.updateRole,
  },
  {
    method: "delete",
    routeName: "deleteRole",
    url: "/delete/:id",
    validator: [],
    middleware: [],
    controller: roleController.deleteRole,
  },
];
