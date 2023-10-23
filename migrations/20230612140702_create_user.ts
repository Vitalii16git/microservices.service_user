import { Knex } from "knex";
import {
  SYSTEM_ROLES,
  ALL_PERMISSIONS,
  USER_PERMISSIONS,
} from "../src/config/permissions";
import { hash } from "bcrypt";

export async function up(knex: Knex): Promise<void> {
  // creating user table
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("email", 255).notNullable().unique();
    table.string("name", 255).unique();
    table.string("password", 255).notNullable();
    table.integer("roleId").unsigned().defaultTo(2);
    table.string("address", 255);
    table.boolean("isBanned").defaultTo(false);
    table.string("verificationCode", 255);
    table.boolean("isEmailVerified").defaultTo(false);
    table.string("refreshToken", 255);
    table.json("tags");
  });

  // creating roles table
  await knex.schema.createTable("roles", (table) => {
    table.increments("id").primary();
    table.string("name", 255).unique().notNullable();
    table.json("permissions").defaultTo([]);
  });

  // seed Super Admin role
  await knex("roles").insert({
    name: SYSTEM_ROLES.SUPER_ADMIN,
    permissions: { data: ALL_PERMISSIONS },
  });

  // seed Super Admin role
  await knex("roles").insert({
    name: SYSTEM_ROLES.USER,
    permissions: { data: USER_PERMISSIONS },
  });

  // seed Super Admin user
  await knex("users").insert({
    email: "admin@gmail.com",
    name: "Super Admin",
    roleId: 1,
    password: await hash("admin123", 10),
    isEmailVerified: true,
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("roles");
}
