// App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Register from "./components/Register";
import UserPosts from "./components/UserPosts";
import CreatePost from "./components/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
