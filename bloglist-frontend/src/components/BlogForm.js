import { Box, Button, Container, TextField } from '@mui/material';
import { useState } from 'react';

function BlogForm({ createBlog }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');

  const handleOnSubmit = (event) => {
    event.preventDefault();
    createBlog({ title, author, url });
    setTitle('');
    setAuthor('');
    setUrl('');
  };

  return (
    <>
      {/* Title */}
      <h2>Create a new blog</h2>

      {/* Form */}
      <form onSubmit={handleOnSubmit} style={{ dispaly: 'flex' }}>
        <Container maxWidth="xs" disableGutters style={{ margin: 0 }}>
          {/* Title Input */}
          <TextField
            id="title"
            label="Title"
            size="small"
            type="text"
            value={title}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
            fullWidth
          />

          <Box mb={1} />

          {/* Author Input */}
          <TextField
            id="author"
            label="Author"
            size="small"
            type="text"
            value={author}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
            fullWidth
          />

          <Box mb={1} />

          {/* Url Input */}
          <TextField
            id="url"
            label="URL"
            size="small"
            type="text"
            value={url}
            name="Url"
            onChange={({ target }) => setUrl(target.value)}
            fullWidth
          />

          <Box mb={2} />

          {/* Submit Button */}
          <Button variant="contained" type="submit" id="create-button">
            create
          </Button>
        </Container>
      </form>
    </>
  );
}

export default BlogForm;
