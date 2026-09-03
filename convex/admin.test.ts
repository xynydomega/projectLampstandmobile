/// <reference types="vite/client" />

import { expect, test } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function createUser(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("users", {});
  });
}

test("rejects unauthenticated admin queries", async () => {
  const t = convexTest(schema, modules);

  await expect(t.query(api.admin.getOverviewMetrics, {})).rejects.toThrow(
    "Not authenticated",
  );
});

test("rejects authenticated non-admin users", async () => {
  const t = convexTest(schema, modules);
  const userId = await createUser(t);
  const user = t.withIdentity({ subject: `${userId}|session` });

  await expect(user.query(api.admin.getOverviewMetrics, {})).rejects.toThrow(
    "Forbidden: admin access required",
  );
});

test("bootstraps only the first admin", async () => {
  const t = convexTest(schema, modules);
  const firstUserId = await createUser(t);
  const secondUserId = await createUser(t);
  const firstUser = t.withIdentity({ subject: `${firstUserId}|session` });
  const secondUser = t.withIdentity({ subject: `${secondUserId}|session` });

  await expect(
    firstUser.mutation(api.admin.bootstrapFirstAdmin, {}),
  ).resolves.toMatchObject({ success: true, userId: firstUserId });

  await expect(
    secondUser.mutation(api.admin.bootstrapFirstAdmin, {}),
  ).rejects.toThrow("An admin already exists");

  const firstUserRecord = await t.run((ctx) => ctx.db.get(firstUserId));
  const secondUserRecord = await t.run((ctx) => ctx.db.get(secondUserId));
  expect(firstUserRecord?.role).toBe("admin");
  expect(secondUserRecord?.role).toBeUndefined();
});

test("returns the admin user directory through a paginated query", async () => {
  const t = convexTest(schema, modules);
  const userId = await createUser(t);
  const user = t.withIdentity({ subject: `${userId}|session` });

  await user.mutation(api.admin.bootstrapFirstAdmin, {});

  const directory = await user.query(api.admin.getUserDirectory, {
    paginationOpts: { numItems: 10, cursor: null },
  });

  expect(directory.page).toHaveLength(1);
  expect(directory.page[0]).toMatchObject({ userId, email: "No Email" });
});
