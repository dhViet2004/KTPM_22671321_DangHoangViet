const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sampledb';

let collection;

async function bootstrap() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();
  collection = db.collection('items');

  app.get('/', (req, res) => {
    res.send('Node.js + MongoDB is running');
  });

  app.post('/items', async (req, res) => {
    const payload = req.body || {};
    const result = await collection.insertOne(payload);
    res.status(201).json({ id: result.insertedId });
  });

  app.get('/items', async (req, res) => {
    const docs = await collection.find({}).toArray();
    res.json(docs);
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
