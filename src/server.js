import express from "express";
import bodyParser from "body-parser";
import path from "path";

import cors from "cors";

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://abhishek001:aBcd1234@cluster0.ir9ke.mongodb.net/my-blog-backend?retryWrites=true&w=majority";
const dbName = "my-blog-backend";
const collectionName = "articles";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const app = express();
app.use(express.static(path.join(__dirname, "/build")));
app.use(cors());

app.use(bodyParser.json());

const WithDB = async (operations) => {
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);

    await operations(db);

    client.close();
  } catch (err) {
    res.status(500).send({ message: "Database Error", err });
  }
};

app.get("/api/articles/:name", async (req, res) => {
  const articleName = req.params.name;
  await WithDB(async (db) => {
    const articlesInfo = await db
      .collection(collectionName)
      .findOne({ name: articleName });
    console.log(articlesInfo);
    res.status(200).send(articlesInfo);
  });
});

/* app.get("/api/articles/:name", async (req, res) => {
  const articleName = req.params.name;
  try {
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);

    const articlesInfo = await db
      .collection(collectionName)
      .findOne({ name: articleName });
    res.status(200).json(articlesInfo);

    client.close();
  } catch (err) {
    res.status(500).send({ message: "Database Error", err });
  }
}); */

/* app.get("/api/articles/:name", (req, res) => {
  //console.log(req.params.name);
  const articleName = req.params.name;
  try {
    client.connect((err) => {
      const collection = client.db("my-blog-backend").collection("articles");
      //console.log(collection);
      collection.find({ name: articleName }).toArray((err, docs) => {
        //collection.find({}, {}).toArray((err, docs) => {
        if (err) {
          // if an error happens
          res.send("Error in GET req.");
        } else {
          let items = [];
          docs.forEach(function (doc) {
            items.push(doc);
          });
          console.log(JSON.stringify(items));
          res.status(200).json(items);
          client.close();
        }
      });
    });
  } catch (error) {
    console.warn("ERROR: " + error);
    res.status(500).send("Error in GET req." + error);
  }
}); */

app.post("/api/articles/:name/upvote", async (req, res) => {
  const articleName = req.params.name;

  await WithDB(async (db) => {
    const articleInfo = await db
      .collection(collectionName)
      .findOne({ name: articleName });

    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          upvotes: articleInfo.upvotes + 1,
        },
      }
    );

    const updatedArticleInfo = await db
      .collection(collectionName)
      .findOne({ name: articleName });
    console.log(updatedArticleInfo);

    res.status(200).json(updatedArticleInfo);
  });
});

app.post("/api/articles/:name/add-comment", async (req, res) => {
  const articleName = req.params.name;
  const { username, text } = req.body;
  await WithDB(async (db) => {
    const articleInfo = await db
      .collection(collectionName)
      .findOne({ name: articleName });

    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text }),
        },
      }
    );

    const updatedArticleInfo = await db
      .collection(collectionName)
      .findOne({ name: articleName });
    console.log(updatedArticleInfo);

    res.status(200).json(updatedArticleInfo);
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(8000, () => console.log("Listening on port 8000"));
