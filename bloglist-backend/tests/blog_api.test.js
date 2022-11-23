const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

beforeEach(async () => {
  await Blog.deleteMany({});

  await Blog.insertMany(helper.initialBlogs);
});

describe('When there are some blogs saved initially', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs');

    const titles = response.body.map((r) => r.title);

    expect(titles).toContain('React patterns');
  });

  test('blogs should contain id property (not _id)', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body[0].id).toBeDefined();
  });
});

describe('When trying to view a specific blog', () => {
  test('succeeds when using a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(resultBlog.body).toEqual(blogToView);
  });

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = mongoose.Types.ObjectId();

    await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
  });

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5e8cae887f883f27e06f54a66';

    await api.get(`/api/blogs/${invalidId}`).expect(400);
  });
});

describe('When adding a new blog', () => {
  let token = null;
  beforeAll(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('password', 10);
    const newUser = new User({ username: 'jane', passwordHash });

    await newUser.save();

    // Login user to get token
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' });

    console.log(loginResponse.body);

    token = loginResponse.body.token;
  });

  test('a valid blog can be added by an authorized user', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map((blog) => blog.title);

    expect(titles).toHaveLength(helper.initialBlogs.length + 1);
    expect(titles).toContain('New blog');
  });

  test('if likes property is misssing from the request, it will default to value 0', async () => {
    const newBlog = {
      title: 'Another blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    expect(blogsAtEnd[helper.initialBlogs.length].likes).toBe(0);
  });

  test('a blog without title or url is not added', async () => {
    const newBlog = {
      likes: 12,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test('an unauthorized user cannot create a blog', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    };

    token = null;

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe('A deletion of a blog', () => {
  let token = null;
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('password', 10);
    const user = new User({ username: 'jane', passwordHash });

    await user.save();

    // Login user to get token
    await api
      .post('/api/login')
      .send({ username: 'jane', password: 'password' })
      .then((res) => {
        return (token = res.body.token);
      });

    const newBlog = {
      title: 'Another blog',
      author: 'Jane Doe',
      url: 'http://dummyurl.com',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    return token;
  });

  test('succeeds with status 402 if id is valid', async () => {
    const blogsAtStart = await Blog.find({}).populate('user');

    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await Blog.find({}).populate('user');

    expect(blogsAtStart).toHaveLength(1);
    expect(blogsAtEnd).toHaveLength(0);
    expect(blogsAtEnd).toEqual([]);
  });

  test('fails when user is not authorized', async () => {
    const blogsAtStart = await Blog.find({}).populate('user');

    const blogToDelete = blogsAtStart[0];

    token = null;

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(401);

    const blogsAtEnd = await Blog.find({}).populate('user');

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    expect(blogsAtStart).toEqual(blogsAtEnd);
  });
});

describe('Updating the likes of a blog', () => {
  test('succeeds with status 400 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb();

    const blogToUpdate = blogsAtStart[0];

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 12 })
      .expect(200);

    const blogsAtEnd = await helper.blogsInDb();

    const updatedBlog = blogsAtEnd[0];

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    expect(updatedBlog.likes).toBe(12);
  });

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = mongoose.Types.ObjectId();

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send({ likes: 12 })
      .expect(404);
  });

  test('fails with statuscode 400 if the id is invalid', async () => {
    const invalidId = '5e8cae887f883f27e06f54a66';

    await api.put(`/api/blogs/${invalidId}`).send({ likes: 12 }).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
