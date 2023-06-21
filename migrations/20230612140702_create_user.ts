import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("email").notNullable().unique();
    table.string("name").unique();
    table.string("password").notNullable();
    table.string("address");
    table.boolean("isBanned").defaultTo(false);
    table.string("verificationCode");
    table.boolean("isEmailVerified").defaultTo(false);
    table.json("personal");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
}
