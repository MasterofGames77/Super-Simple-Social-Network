import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface Post {
  id: number;
  user_id: number;
  content: string;
  likes: number;
  dislikes: number;
}

const UserPosts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/posts/user/${id}`)
      .then((response) => {
        const postsWithInteractions = response.data.map((post: Post) => ({
          ...post,
          likes: post.likes || 0,
          dislikes: post.dislikes || 0,
        }));
        setPosts(postsWithInteractions);
      })
      .catch((error) => {
        console.error("There was an error fetching the posts!", error);
      });
  }, [id]);

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
      <h1>User Posts</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.content}</p>
          <button onClick={() => handleInteraction(post.id, "like")}>
            Like {post.likes}
          </button>
          <button onClick={() => handleInteraction(post.id, "dislike")}>
            Dislike {post.dislikes}
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserPosts;
