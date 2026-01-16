import express from "express";
import mongoose, { Document, Schema } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan";
import { rmSync } from "fs";

dotenv.config();

const app = express();
const port = Number(process.env.port);
const dbConn = process.env.MONGO_URI;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(morgan("dev"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

interface IBlog extends Document {
  blogTitle: string;
  blogContent: string;
  blogAuthor: string;
  createdAt: Date;
}

const blogSchema = new Schema(
  {
    blogTitle: { type: String, required: true, maxLength: 50 },
    blogContent: { type: String, required: true, maxLength: 500 },
    blogAuthor: { type: String, required: true, maxLength: 30 },
  },
  { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", blogSchema);

startServer();

app.get("/", async (req, res) => {
  try {
    const blogPosts = await Blog.find();
    res.render("index", { posts: blogPosts });
  } catch (error: any) {
    console.log(error || error.message);
    res.status(500).send("Error loading posts");
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/compose", (req, res) => {
  res.render("compose", { post: null });
});

app.post("/compose", async (req, res) => {
  try {
    const { blogTitle, blogContent, blogAuthor } = req.body;

    if (!blogTitle || !blogContent || !blogAuthor) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields!" });
    }

    const publishPost = new Blog({
      blogTitle: blogTitle,
      blogContent: blogContent,
      blogAuthor: blogAuthor,
    });

    await publishPost.save();
    res.json({ success: true });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ success: false, message: "Database Error" });
  }
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const postToEdit = await Blog.findById(id);
    if (!postToEdit) return res.redirect("/");
    res.render("compose", { post: postToEdit });
  } catch (error: any) {
    res.redirect("/");
  }
});

app.patch("/edit/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { blogTitle, blogContent, blogAuthor } = req.body;
    if (!blogTitle || !blogContent || !blogAuthor) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Fields" });
    }

    await Blog.findByIdAndUpdate(id, {
      blogTitle: blogTitle,
      blogContent: blogContent,
      blogAuthor: blogAuthor,
    });
    res.json({ success: true });
  } catch (error: any) {
    console.log(error || error.message);
    res.status(500).json({ success: false, message: "Could not update post" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await Blog.findByIdAndDelete(id);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    console.log(error || error.message);
    res
      .status(500)
      .json({ success: false, message: "Server Error: Could not delete" });
  }
});

async function startServer() {
  try {
    if (!dbConn) {
      throw new Error("Cannot Connect to MongoDB!");
    }

    await mongoose.connect(dbConn);
    console.log("Connected to MongoDB!");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error: any) {
    console.log(error.response?.data || error.message);
    mongoose.disconnect();
  }
}
