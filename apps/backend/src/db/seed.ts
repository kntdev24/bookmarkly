import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS startmessage (
    id INTEGER PRIMARY KEY,
    message TEXT NOT NULL
  );

  DELETE FROM startmessage;

  INSERT INTO startmessage (message) VALUES ('Hello WebApp Starterkit!');
`);

console.log("DB seeded successfully.");
db.close();
