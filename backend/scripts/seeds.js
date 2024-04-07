const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
const connection = process.env.MONGODB_URI;
mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");

    // Import Mongoose models
    const User = require(".User");
    const Item = require(".Item");
    const Comment = require(".Comment");

    // Seed the database
    seedDatabase()
      .then(() => {
        console.log("Finished DB seeding");
        process.exit(0);
      })
      .catch((err) => {
        console.error(`Error while running DB seed: ${err.message}`);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  });

async function seedDatabase() {
  for (let i = 0; i < 100; i++) {
    // Add user
    const user = { username: `user${i}`, email: `user${i}@gmail.com` };
    const options = { upsert: true, new: true };
    const createdUser = await User.findOneAndUpdate(user, {}, options);

    // Add item to user
    const item = {
      slug: `slug${i}`,
      title: `title ${i}`,
      description: `description ${i}`,
      seller: createdUser._id,
    };
    const createdItem = await Item.findOneAndUpdate(item, {}, options);

    // Add comments to item
    if (!createdItem.comments || createdItem.comments.length === 0) {
      let commentIds = [];
      for (let j = 0; j < 100; j++) {
        const comment = new Comment({
          body: `body ${j}`,
          seller: createdUser._id,
          item: createdItem._id,
        });
        await comment.save();
        commentIds.push(comment._id);
      }
      createdItem.comments = commentIds;
      await createdItem.save();
    }
  }
}