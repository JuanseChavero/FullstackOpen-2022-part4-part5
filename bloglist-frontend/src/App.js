import { Logout } from '@mui/icons-material';
import { Button, Container } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import LoginForm from './components/LoginForm';
import Notification from './components/Notification';
import Togglable from './components/Toggleable';
import blogService from './services/blogs';
import login from './services/login';

// This app has some basic styling, in future parts I'll improve it
const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [message, setMessage] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const blogFormRef = useRef();

  // Blogs will be sorted by likes only on a rerender of the page
  const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  useEffect(() => {
    // If the token is not expired, get all blogs
    if (user === null) return;

    blogService.getAll().then((blogs) => {
      setBlogs(blogs);
    });
  }, [user]);

  const clearMessage = (time = 10000) => {
    setTimeout(() => {
      setMessage(null);
    }, time);
  };

  const handleLogin = async () => {
    try {
      const user = await login({ username, password });
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername('');
      setPassword('');
    } catch (error) {
      const errorMessage = error.response.data.error
        ? error.response.data.error
        : 'There was an error trying to login';
      setMessage({
        content: errorMessage,
        isError: true,
      });
      clearMessage();
    }
  };

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility();
      const newBlog = await blogService.create(blogObject);
      setMessage({
        content: `A new blog: ${newBlog.title} by ${newBlog.author} has been added`,
      });
      clearMessage();
      setBlogs(blogs.concat(newBlog));
    } catch (error) {
      const errorMessage = error.response.data.error
        ? error.response.data.error
        : 'There was an error when creating the blog';
      setMessage({
        content: errorMessage,
        isError: true,
      });
      clearMessage();
    }
  };

  const deleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogService.remove(id);
        const filteredBlogs = blogs.filter((blog) => blog.id !== id);
        setBlogs(filteredBlogs);
        setMessage({
          content: 'The blog was removed successfully',
        });
        clearMessage();
      } catch (error) {
        setMessage({
          content: 'There was an error when trying to delete the blog',
          isError: true,
        });
        clearMessage();
      }
    }
  };

  const loginForm = () => {
    return (
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleLogin={handleLogin}
        showCancelButton
      />
    );
  };

  const logout = () => {
    window.localStorage.removeItem('loggedBlogAppUser');
    setUser(null);
  };

  const blogsSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Session Info */}
      <div style={{ alignSelf: 'flex-end' }}>
        <span>
          <strong>{user.name}</strong> logged in
        </span>
        <Button
          id="logout-button"
          type="button"
          variant="outlined"
          onClick={logout}
          endIcon={<Logout />}
          style={{ marginLeft: 5 }}
        >
          logout
        </Button>
      </div>

      {/* Blogs */}
      <h2>Blogs</h2>

      {/* Blog Form */}
      <Togglable buttonLabel="CREATE NEW BLOG" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>

      {/* Blog List */}
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          gap: 10,
        }}
      >
        {sortedBlogs.map((blog) => (
          <li key={blog.id} style={{ listStyle: 'none' }}>
            <Blog blog={blog} handleDelete={deleteBlog} user={user} />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Container>
      <Notification message={message} />
      {!user ? loginForm() : blogsSection()}
    </Container>
  );
};

export default App;
