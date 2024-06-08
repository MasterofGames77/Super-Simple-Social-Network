// UserList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost";

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

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<{ [userId: number]: Post[] }>({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3000/users").then((response) => {
      setUsers(response.data);
      fetchPosts(response.data);
    });
  }, []);

  const fetchPosts = (users: User[]) => {
    users.forEach((user) => {
      axios
        .get(`http://localhost:3000/posts/user/${user.id}`)
        .then((response) => {
          setPosts((prevPosts) => ({
            ...prevPosts,
            [user.id]: response.data,
          }));
        });
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleLikeDislike = async (
    postId: number,
    type: "like" | "dislike"
  ) => {
    try {
      const endpoint = type === "like" ? "like" : "dislike";
      await axios.post(`http://localhost:3000/posts/${postId}/${endpoint}`);
      fetchPosts(users); // Refresh the posts after liking or disliking
    } catch (error) {
      console.error("Error interacting with post: ", error);
    }
  };

  const handlePostCreated = () => {
    axios.get("http://localhost:3000/users").then((response) => {
      fetchPosts(response.data);
    });
  };

  return (
    <div>
      <h1>Super Simple Social Network</h1>
      <button onClick={handleLogout}>Logout</button>
      <CreatePost onPostCreated={handlePostCreated} />
      {users.map((user) => (
        <div key={user.id}>
          <h2>{user.username}</h2>
          <ul>
            {posts[user.id]?.map((post) => (
              <li key={post.id}>
                {post.content}
                <div>
                  Likes: {post.likes} | Dislikes: {post.dislikes}
                </div>
                <div>
                  <button onClick={() => handleLikeDislike(post.id, "like")}>
                    Like
                  </button>
                  <button onClick={() => handleLikeDislike(post.id, "dislike")}>
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

export default UserList;
