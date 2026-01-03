import express from "express";
import morgan from "morgan";
import path from "path";

const app = express();
const port = 3000;

interface BlogPost {
  id: number;
  title: string;
  message: string;
}

const blogPosts: BlogPost[] = [];

// Configuration eto
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Sabay Middlewares eto para di ako malito
app.use(morgan("dev"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home page eto
app.get("/", (req, res) => {
  res.render("index", { posts: blogPosts });
});

// About page eto
app.get("/about", (req, res) => {
  res.render("about");
});

// Compose page eto
app.get("/compose", (req, res) => {
  res.render("compose");
});
// Sending the data to server from Composepage eto
app.post("/compose", (req, res) => {
  const { title, post } = req.body;

  if (!title || !post) {
    return res.status(400).json({ success: false, message: "Missing Fields!" });
  }

  const blogData: BlogPost = {
    id: blogPosts.length + 1,
    title: title,
    message: post,
  };

  blogPosts.push(blogData);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
