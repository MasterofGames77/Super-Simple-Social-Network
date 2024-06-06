import React, { useEffect, useState } from "react"
import axios from "axios"
import { FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa"

const PostsAll = () => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/posts")
        console.log(res.data)
        setPosts(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchAllPosts()
  }, [])

  const handleLike = () => {
    alert("Post has been Liked")
  }

  const handleDislike = () => {
    alert("Post has been Disliked")
  }

  return (
    <div className="container">
      <div className="row">
        {posts.map((post) => (
          <div key={post.id} className="col-md-6 mb-4 mt-4">
            <div className="card">
              <div className="card-body">
                <h6 className="card-subtitle mb-2 text-muted">{post.id}</h6>
                <p className="card-text">{post.content}</p>
                <a href="#" className="card-link" onClick={handleLike}>
                  <FaRegThumbsUp />
                </a>
                <a href="#" className="card-link" onClick={handleDislike}>
                  <FaRegThumbsDown />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PostsAll
