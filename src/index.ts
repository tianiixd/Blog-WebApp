import express from "express";
import morgan from "morgan";
import path from "path";
import mongoose, { Document, Schema } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blogDB";

interface IBlogPost extends Document {
  blogTitle: string;
  message: string;
}

// Eto yung pagcreate ng schema sa mongodb
// we imported the way from mongoose especially the Schema object
const blogSchema = new Schema({
  blogTitle: { type: String, required: true },
  message: { type: String, required: true },
});

// mongodb collection eto, and acts as a model too
const Blog = mongoose.model<IBlogPost>("Blog", blogSchema);

// Configuration eto
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Sabay Middlewares eto para di ako malito
app.use(morgan("dev"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

async function startServer() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error: any) {
    console.error(" Failed to connect to MongoDB:", error);
    process.exit(1); // Stop app if DB is dead
  }
}

startServer();

// Home page eto
app.get("/", async (req, res) => {
  try {
    // this findOne na method sa mongodb returns an array so we can run forEach, map, filter, reduce anytime
    const allPosts = await Blog.find({});
    res.render("index", { posts: allPosts });
  } catch (error: any) {
    console.log(error);
    res.status(500).send("Error loading posts");
  }
});

// About page eto
app.get("/about", (req, res) => {
  res.render("about");
});

// Compose page eto
app.get("/compose", (req, res) => {
  res.render("compose");
});

// Sending the data to server from Composepage eto, so /compouse route eto dito isesend ang data
app.post("/compose", async (req, res) => {
  const { title, post } = req.body;

  if (!title || !post) {
    return res.status(400).json({ success: false, message: "Missing Fields!" });
  }

  try {
    const publishPost = new Blog({
      blogTitle: title,
      message: post,
    });

    await publishPost.save();
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: "Database Error" });
  }

  res.json({ success: true });
});
