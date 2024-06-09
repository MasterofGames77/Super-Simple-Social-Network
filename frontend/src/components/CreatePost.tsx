import React, { useState } from "react";
import axios from "axios";

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user.id) {
      console.error("No user found, please log in.");
      return;
    }

    axios
      .post("http://localhost:3000/posts", { user_id: user.id, content })
      .then(() => {
        console.log("Post created successfully!");
        setContent(""); // Clear the content input after successful submission
        onPostCreated(); // Notify parent to refresh the post list
      })
      .catch((error) => {
        console.error("There was an error creating the post!", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Content</label>
        <br></br>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <button type="submit">Create Post</button>
    </form>
  );
};

export default CreatePost;
