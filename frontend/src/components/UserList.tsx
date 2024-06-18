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
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<{ [userId: number]: Post[] }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      await axios.post(`http://localhost:3000/posts/${postId}/${type}`);
      setPosts((prevPosts) => {
        const updatedPosts = { ...prevPosts };
        Object.keys(updatedPosts).forEach((userId) => {
          updatedPosts[parseInt(userId)] = updatedPosts[parseInt(userId)].map(
            (post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  likes: type === "like" ? post.likes + 1 : post.likes,
                  dislikes:
                    type === "dislike" ? post.dislikes + 1 : post.dislikes,
                };
              }
              return post;
            }
          );
        });
        return updatedPosts;
      });
    } catch (error) {
      console.error("Error interacting with post:", error);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleShowAllPosts = () => {
    setSelectedUser(null);
  };

  return (
    <div className="container">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <h1>Super Simple Social Network</h1>
      <CreatePost onPostCreated={() => fetchPosts(users)} />
      {selectedUser ? (
        <div>
          <h2>Posts by {selectedUser.username}</h2>
          <button onClick={handleShowAllPosts}>Show All Posts</button>
          <ul>
            {posts[selectedUser.id]?.map((post) => (
              <li key={post.id} className="post">
                <div>
                  <strong>Post:</strong> {post.content}
                </div>
                <div>
                  <strong>Created On:</strong>{" "}
                  {new Date(post.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>Likes:</strong> {post.likes}
                </div>
                <div>
                  <strong>Dislikes:</strong> {post.dislikes}
                </div>
                <div className="actions">
                  <button onClick={() => handleLikeDislike(post.id, "like")}>
                    Like
                  </button>
                  <button
                    className="dislike"
                    onClick={() => handleLikeDislike(post.id, "dislike")}
                  >
                    Dislike
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        users.map((user) => (
          <div key={user.id}>
            <h2
              onClick={() => handleUserClick(user)}
              style={{ cursor: "pointer" }}
            >
              {user.username}
            </h2>
            <ul>
              {posts[user.id]?.map((post) => (
                <li key={post.id} className="post">
                  <div>
                    <strong>Post:</strong> {post.content}
                  </div>
                  <div>
                    <strong>Created On:</strong>{" "}
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Likes:</strong> {post.likes}
                  </div>
                  <div>
                    <strong>Dislikes:</strong> {post.dislikes}
                  </div>
                  <div className="actions">
                    <button onClick={() => handleLikeDislike(post.id, "like")}>
                      Like
                    </button>
                    <button
                      className="dislike"
                      onClick={() => handleLikeDislike(post.id, "dislike")}
                    >
                      Dislike
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default UserList;
