import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("  MONGODB_URI not found in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

function loadJSON(filename: string) {
  const filepath = join(process.cwd(), "data", filename);
  const raw = readFileSync(filepath, "utf-8");
  const stripped = raw.replace(/\/\/.*$/gm, "");
  return JSON.parse(stripped);
}

async function seed() {
  try {
    await client.connect();
    console.log("  Connected to MongoDB Atlas");

    const db = client.db("scout");

    const collections = [
      { name: "teams",   file: "teams.json" },
      { name: "matches", file: "matches.json" },
      { name: "venues",  file: "venues.json" },
      { name: "cities",  file: "cities.json" },
    ];

    for (const { name, file } of collections) {
      const data = loadJSON(file);

      await db.collection(name).drop().catch(() => {});

      const result = await db.collection(name).insertMany(data);
      console.log(`  ${name}: inserted ${result.insertedCount} documents`);
    }

    console.log("\n  Creating indexes...");

    const matches = db.collection("matches");
    await matches.createIndex({ home_team: 1 });
    await matches.createIndex({ away_team: 1 });
    await matches.createIndex({ group: 1 });
    await matches.createIndex({ date: 1 });
    await matches.createIndex({ venue_id: 1 });
    await matches.createIndex({ home_team: 1, away_team: 1 });
    console.log("  matches indexes created");

    const teams = db.collection("teams");
    await teams.createIndex({ group: 1 });
    await teams.createIndex({ confederation: 1 });
    await teams.createIndex({ fifa_rank: 1 });
    console.log("  teams indexes created");

    const venues = db.collection("venues");
    await venues.createIndex({ city: 1 });
    console.log("  venues indexes created");

    const cities = db.collection("cities");
    await cities.createIndex({ name: 1 });
    await cities.createIndex({ country: 1 });
    console.log("  cities indexes created");

    console.log("\n  Seeding complete! All collections and indexes are ready.");
    console.log("  Next: go to Atlas UI  Search  Create Vector Search index on teams.embedding");

  } catch (err) {
    console.error("  Seeding failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();