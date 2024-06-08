// UserList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
}

interface Post {
  id: number;
  content: string;
  likes: number;
  dislikes: number;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<{ [userId: number]: Post[] }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get("http://localhost:3000/users");
        setUsers(usersResponse.data);
        fetchPosts(usersResponse.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  const fetchPosts = async (users: User[]) => {
    try {
      const postsData = await Promise.all(
        users.map((user) =>
          axios.get(`http://localhost:3000/posts/user/${user.id}`)
        )
      );

      const postsByUser: { [userId: number]: Post[] } = {};
      postsData.forEach((response, index) => {
        postsByUser[users[index].id] = response.data;
      });

      setPosts(postsByUser);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLikeDislike = async (
    postId: number,
    type: "like" | "dislike"
  ) => {
    try {
      await axios.post(`http://localhost:3000/posts/${postId}/interact`, {
        type,
      });
      // Refresh posts after interaction
      fetchPosts(users);
    } catch (error) {
      console.error("Error interacting with post:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <h1>Super Simple Social Network</h1>
      <button onClick={handleLogout}>Logout</button>
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
