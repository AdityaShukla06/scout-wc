const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing MONGODB_URI environment variable");
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

async function connectMongo() {
  try {
    await client.connect();
    db = client.db("scout");
    console.log(" Successfully connected to MongoDB Atlas");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}
connectMongo();

function sanitizeFilter(rawFilter) {
  const jsonStr = JSON.stringify(rawFilter);
  if (jsonStr.includes('"$where"') || jsonStr.includes('"$regex"') || jsonStr.includes('"$expr"')) {
    throw new Error("Dangerous NoSQL operators are not allowed.");
  }
  return rawFilter;
}

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// REST endpoint for Dialogflow CX OpenAPI tool call
app.post('/query', async (req, res) => {
  try {
    const { collection, filter = {} } = req.body;
    if (!collection) {
      return res.status(400).json({ error: "Missing collection parameter" });
    }
    
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    
    console.log(` Querying collection: ${collection} with filter:`, JSON.stringify(filter));
    
    const allowedCollections = ["matches", "teams", "venues", "cities"];
    if (!allowedCollections.includes(collection)) {
      return res.status(400).json({ error: `Invalid collection: ${collection}. Allowed: ${allowedCollections.join(", ")}` });
    }
    
    const safeFilter = sanitizeFilter(filter);
    const results = await db.collection(collection).find(safeFilter).limit(20).toArray();
    res.json(results);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: error.message });
  }
});

// JSON-RPC MCP endpoint
app.post('/mcp', async (req, res) => {
  try {
    const request = req.body;
    
    if (request.method === 'tools/list') {
        return res.json({
            jsonrpc: "2.0",
            id: request.id,
            result: {
                tools: [
                    {
                        name: "mongodb_query",
                        description: "Query the MongoDB database for World Cup 2026 data including teams, matches, venues, and cities.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                collection: { type: "string" },
                                filter: { type: "object" }
                            },
                            required: ["collection"]
                        }
                    }
                ]
            }
        });
    }

    if (request.method === 'tools/call') {
      const { name, arguments: args } = request.params || {};
      if (name === 'mongodb_query') {
        const { collection, filter = {} } = args || {};
        if (!db) {
          return res.status(500).json({ error: "Database not connected" });
        }
        const safeFilter = sanitizeFilter(filter);
        const results = await db.collection(collection).find(safeFilter).limit(20).toArray();
        return res.json({
          jsonrpc: "2.0",
          id: request.id,
          result: {
            content: [{ type: "text", text: JSON.stringify(results) }]
          }
        });
      }
    }

    res.json({
        jsonrpc: "2.0",
        id: request.id,
        result: {
            content: [{ type: "text", text: JSON.stringify([{ _id: "mock", note: "Connected to MongoDB MCP wrapper" }]) }]
        }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});

