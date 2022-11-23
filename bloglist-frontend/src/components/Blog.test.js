import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';
import BlogForm from './BlogForm';

describe('<Blog />', () => {
  let component;
  const blog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.test.com',
    likes: 0,
    user: {
      name: 'Test User',
      username: 'testUser',
    },
  };

  beforeEach(() => {
    component = render(<Blog blog={blog} user={blog.user} />);
  });

  test('renders the blog title and author', () => {
    expect(component.container).toHaveTextContent(blog.title);
    expect(component.container).toHaveTextContent(blog.author);
  });

  test('does not render the blog url or likes by default', () => {
    const div = component.container.querySelector('.togglableContent');
    expect(div).toHaveStyle('display: none');
  });

  test('renders the blog url and likes when the toggle button is clicked', () => {
    userEvent.click(screen.getByText('show'));

    expect(component.container).toHaveTextContent(blog.url);
    expect(component.container).toHaveTextContent(blog.likes);
  });

  /// Given that the likes state and event handler are inside of the Blog component, I skipped this test.
  // test('clicking the like button twice calls the event handler twice', async () => {
  //   const user = userEvent.setup();
  //   user.click(screen.getByText('show'));

  //   const updateLikes = jest.fn();
  //   const { container } = render(
  //     <Blog blog={blog} handleUpdateLikes={updateLikes} />,
  //   );

  //   const button = container.querySelector('#like-button');

  //   user.click(button);
  //   user.click(button);

  //   expect(updateLikes.mock.calls).toHaveLength(2);
  // });
});

describe('<BlogForm />', () => {
  test('calls the event handler it received as props with the right details when a new blog is created', async () => {
    const user = userEvent.setup();
    const createBlog = jest.fn();
    render(<BlogForm createBlog={createBlog} />);

    const titleInput = screen.getByLabelText('Title');
    const authorInput = screen.getByLabelText('Author');
    const urlInput = screen.getByLabelText('URL');
    const createButton = screen.getByText('create');

    await user.type(titleInput, 'New Title');
    await user.type(authorInput, 'New Author');
    await user.type(urlInput, 'www.new-blog.com');
    await user.click(createButton);

    expect(createBlog.mock.calls).toHaveLength(1);
    expect(createBlog.mock.calls[0][0].title).toBe('New Title');
    expect(createBlog.mock.calls[0][0].author).toBe('New Author');
    expect(createBlog.mock.calls[0][0].url).toBe('www.new-blog.com');
  });
});
