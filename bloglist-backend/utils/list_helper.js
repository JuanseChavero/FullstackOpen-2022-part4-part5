const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  const favoriteBlog = blogs.reduce(
    (max, blog) => (max.likes > blog.likes ? max : blog),
    { likes: 0 },
  );

  return favoriteBlog.likes > 0
    ? {
        title: favoriteBlog.title,
        author: favoriteBlog.author,
        likes: favoriteBlog.likes,
      }
    : undefined;
};

const mostBlogs = (blogs) => {
  const authors = blogs.map((blog) => blog.author); // ['luca', 'andrea', 'luca', 'juan', 'ignacio', 'luca']
  const uniqueAuthors = [...new Set(authors)]; // ['luca', 'andrea', 'juan', 'ignacio']
  const authorCount = uniqueAuthors.map((author) => {
    return {
      name: author,
      blogs: authors.filter((blogAuthor) => blogAuthor === author).length,
    };
  });

  const mostBlogs = authorCount.reduce(
    (max, author) => (max.blogs > author.blogs ? max : author),
    { blogs: 0 },
  );

  return {
    author: mostBlogs.name,
    blogs: mostBlogs.blogs,
  };
};

const mostLikes = (blogs) => {
  const authors = blogs.map((blog) => blog.author);
  const uniqueAuthors = [...new Set(authors)];
  const authorCount = uniqueAuthors.map((author) => {
    return {
      name: author,
      likes: blogs
        .filter((blog) => blog.author === author)
        .reduce((sum, blog) => sum + blog.likes, 0),
    };
  });

  const mostLikes = authorCount.reduce(
    (max, author) => (max.likes > author.likes ? max : author),
    { likes: 0 },
  );

  return {
    author: mostLikes.name,
    likes: mostLikes.likes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
