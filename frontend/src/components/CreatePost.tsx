import React, { useState } from "react";
import axios from "axios";

const CreatePost: React.FC = () => {
  const [content, setContent] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, please log in.");
      return;
    }

    axios
      .post(
        "http://localhost:3000/posts",
        { content },
        {
          headers: { "x-access-token": token },
        }
      )
      .then(() => {
        setContent("");
      })
      .catch((error) => {
        console.error("There was an error creating the post!", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Content</label>
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
