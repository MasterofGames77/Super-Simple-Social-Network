// Home.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  likes: number;
  dislikes: number;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/posts")
      .then((response) => {
        const postsWithInteractions = response.data.map((post: Post) => ({
          ...post,
          likes: post.likes || 0,
          dislikes: post.dislikes || 0,
        }));
        setPosts(postsWithInteractions);
        setError(null); // Clear error if successful
      })
      .catch((error) => {
        console.error("There was an error fetching the posts!", error);
        setError("There was an error fetching the posts!");
      });
  }, []);

  const handleInteraction = (postId: number, type: "like" | "dislike") => {
    axios
      .post(`http://localhost:3000/posts/${postId}/interact`, { type })
      .then(() => {
        // Update the UI to reflect the interaction
        const updatedPosts = posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                [type === "like" ? "likes" : "dislikes"]:
                  post[type === "like" ? "likes" : "dislikes"] + 1,
              }
            : post
        );
        setPosts(updatedPosts);
      })
      .catch((error) => {
        console.error("There was an error interacting with the post!", error);
      });
  };

  return (
    <div>
      <h1>All Posts</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <Link to={`/user/${post.user_id}`}>{post.username}</Link>
            <p>{post.content}</p>
            <button onClick={() => handleInteraction(post.id, "like")}>
              Like {post.likes}
            </button>
            <button onClick={() => handleInteraction(post.id, "dislike")}>
              Dislike {post.dislikes}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
