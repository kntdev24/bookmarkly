import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createClient } from "@libsql/client";

const app = new Hono();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.get("/api/message", async (c) => {
  const result = await db.execute(
    "SELECT message FROM startmessage LIMIT 1"
  );
  const row = result.rows[0];
  return c.json({ message: row?.message ?? "" });
});

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Backend running on http://localhost:3000");
});
