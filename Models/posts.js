const mongoose = require("mongoose");
const {Schema} = mongoose;

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationDemo");
}

const userSchema = new Schema({
  username: String,
  email: String,
});

// a reference to the User who wrote it (stores only the User's ObjectId, not the full user data
const postSchema = new Schema({
  content: String,
  likes: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Turn the schemas into usable models for creating/reading/updating/deleting
const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// Creates a new post and links it to "rahulkumar".
// Reuses the existing user if one already exists (avoids creating
// duplicate users every time this function runs), otherwise creates
// a new one — this is the "find or create" pattern.
const addData = async () => {
  // Try to find the user first
  let user1 = await User.findOne({ username: "rahulkumar" });

  // If no user exists yet, create one (only happens the very first time)
  if (!user1) {
    user1 = new User({
      username: "rahulkumar",
      email: "rahul@gmail.com",
    });
    await user1.save();
    console.log("New user created:", user1);
  } else {
    console.log("Existing user found:", user1);
  }

  let post3 = new Post({
    content: "Good Morning! ☀️",
    likes: 15,
  });

  post3.user = user1;
  await post3.save();

  console.log("New post saved:", post3);
};

// addData();

// Fetches every post and uses .populate("user") to replace each post's
// raw user ObjectId with the actual full User document (username, email)
// instead of just an unreadable ID
const showPosts = async () => {
  let posts = await Post.find({}).populate("user");
  console.log(posts);
};

showPosts();