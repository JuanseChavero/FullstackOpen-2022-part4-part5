import { Delete, ThumbUp } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import Accordion from './Accordion';
import blogService from '../services/blogs';

const Blog = ({ blog, handleDelete, user }) => {
  const [likes, setLikes] = useState(blog.likes);

  // In reality, this condition probably should be with the user ID
  const isBlogCreator = blog.user.username === user.username;

  const handleUpdateLikes = async () => {
    const updatedBlog = { ...blog, likes: likes + 1 };

    try {
      setLikes((prevLikes) => prevLikes + 1);
      await blogService.update(blog.id, updatedBlog);
    } catch (error) {
      // I should probably throw some error here
      setLikes((prevLikes) => prevLikes - 1);
    }
  };

  const deleteBlog = () => {
    if (!isBlogCreator) return;

    handleDelete(blog.id);
  };

  return (
    <Accordion title={`${blog.title} by ${blog.author}`}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '10px 15px',
        }}
      >
        <a href={blog.url}>{blog.url}</a>
        <div>
          <span>Likes: {'  '}</span>
          <strong className="blog-likes" title="Likes">
            {likes}
          </strong>
          <Button
            id="like-button"
            variant="outlined"
            onClick={handleUpdateLikes}
            style={{ marginLeft: 7.5 }}
            title="Like this"
          >
            <ThumbUp />
          </Button>
        </div>
        <div>Added by: {blog.user.name}</div>
        {isBlogCreator ? (
          <div>
            <Button
              id="delete-button"
              startIcon={<Delete />}
              onClick={deleteBlog}
              color="error"
              variant="outlined"
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>
    </Accordion>
  );
};

export default Blog;
