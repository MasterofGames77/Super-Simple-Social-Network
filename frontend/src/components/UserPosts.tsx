import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
}

interface Post {
  id: number;
  user_id: number;
  content: string;
  likes: number;
  dislikes: number;
}

const UserPosts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Fetch users
    axios.get("http://localhost:3000/users").then((response) => {
      setUsers(response.data);
    });

    // Fetch posts
    axios.get("http://localhost:3000/posts").then((response) => {
      setPosts(response.data);
    });
  }, []);

  const handleLikeDislike = async (
    postId: number,
    type: "like" | "dislike"
  ) => {
    try {
      await axios.post(`http://localhost:3000/posts/${postId}/interact`, {
        type,
      });
      // Refresh posts after interaction
      const postsData = await axios.get("http://localhost:3000/posts");
      setPosts(postsData.data);
    } catch (error) {
      console.error("Error interacting with post:", error);
    }
  };

  return (
    <div>
      <h1>User Posts</h1>
      {users.map((user) => (
        <div key={user.id}>
          <h2>{user.username}</h2>
          <ul>
            {posts
              .filter((post) => post.user_id === user.id)
              .map((post) => (
                <li key={post.id}>
                  {post.content}
                  <div>
                    Likes: {post.likes} | Dislikes: {post.dislikes}
                  </div>
                  <div>
                    <button onClick={() => handleLikeDislike(post.id, "like")}>
                      Like
                    </button>
                    <button
                      onClick={() => handleLikeDislike(post.id, "dislike")}
                    >
                      Dislike
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default UserPosts;
