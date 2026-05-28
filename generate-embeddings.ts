import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌  MONGODB_URI not found in .env");
  process.exit(1);
}

// Ensure Google Cloud credentials are set
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

if (!projectId) {
  console.error("❌  GOOGLE_CLOUD_PROJECT not found in .env");
  process.exit(1);
}

// Initialize the new Google Gen AI SDK
const ai = new GoogleGenAI({ 
  vertexai: { project: projectId, location: location }
});

async function generateEmbeddings() {
  const client = new MongoClient(uri as string);

  try {
    await client.connect();
    console.log("✅  Connected to MongoDB Atlas");

    const db = client.db("scout");
    const teamsCollection = db.collection("teams");

    const teams = await teamsCollection.find({}).toArray();
    console.log(`🔍  Found ${teams.length} teams. Generating embeddings...`);

    let updatedCount = 0;

    for (const team of teams) {
      if (!team.style_description) {
        console.warn(`⚠️   Team ${team.name} has no style_description. Skipping.`);
        continue;
      }

      console.log(`⏳  Generating embedding for ${team.name}...`);
      
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: team.style_description,
      });

      const embedding = response.embeddings[0].values; // Returns a number[] of 768 dimensions

      if (embedding && embedding.length > 0) {
        await teamsCollection.updateOne(
          { _id: team._id },
          { $set: { embedding: embedding } }
        );
        updatedCount++;
        console.log(`✅  Updated ${team.name} with ${embedding.length}-dimensional embedding.`);
      } else {
        console.error(`❌  Failed to get embedding for ${team.name}`);
      }
      
      // Slight delay to avoid rate limits on free tier if applicable
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n🎉  Finished! Successfully updated ${updatedCount} teams with embeddings.`);

  } catch (err) {
    console.error("❌  Error during embedding generation:", err);
  } finally {
    await client.close();
  }
}

generateEmbeddings();
