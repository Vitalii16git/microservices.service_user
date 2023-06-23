import { Knex } from "knex";
import { routes } from "../src//routes/routes.object";

// creating users table
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("name").unique();
    table.string("password").notNullable();
    table.string("role");
    table.string("address");
    table.boolean("isBanned").defaultTo(false);
    table.string("verificationCode");
    table.boolean("isEmailVerified").defaultTo(false);
    table.string("refreshToken");
    table.json("personal");
  });

  // creating roles table
  await knex.schema.createTable("roles", (table) => {
    table.increments("id").primary();
    table.string("name").unique().notNullable();
    table.json("permissions").defaultTo([]);
  });

  // creating endpoints table
  await knex.schema.createTable("endpoints", (table) => {
    table.increments("id").primary();
    table.json("names");
  });

  const routeNames: string[] = [];

  await Object.values(routes).forEach((arr) => {
    arr.forEach((route) => {
      if (!routeNames.includes(route.routeName)) {
        routeNames.push(route.routeName);
      }
    });
  });

  // set endpoints table
  await knex("endpoints").insert({
    names: JSON.stringify(routeNames),
  });

  // set Super User
  await knex("roles").insert({
    name: "Super User",
    permissions: JSON.stringify(routeNames),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
  await knex.schema.dropTable("roles");
  await knex.schema.dropTable("endpoints");
}
