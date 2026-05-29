import { MongoClient, ServerApiVersion } from 'mongodb';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function generateEmbeddings() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB");

    const db = client.db("scout");
    const teamsCollection = db.collection("teams");
    const teams = await teamsCollection.find({}).toArray();

    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const clientAuth = await auth.getClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || "scout-wc";
    const token = await clientAuth.getAccessToken();

    for (const team of teams) {
      if (!team.style_description) continue;
      console.log(` Generating embedding for ${team.name}...`);

      const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/text-embedding-004:predict`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instances: [
            { content: team.style_description }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed for ${team.name}:`, errorText);
        continue;
      }

      const result = await response.json();
      const embedding = result.predictions[0].embeddings.values;

      await teamsCollection.updateOne(
        { _id: team._id },
        { $set: { embedding: embedding } }
      );
      console.log(` ${team.name} updated (768 dims)`);
    }

    console.log(" All embeddings generated!");
  } catch (error) {
    console.error("Error generating embeddings:", error);
  } finally {
    await client.close();
  }
}

generateEmbeddings();
