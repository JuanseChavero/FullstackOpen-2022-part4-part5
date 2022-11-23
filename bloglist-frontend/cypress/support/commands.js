/// Commands to execute in the tests

// Login request
Cypress.Commands.add('login', ({ username, password }) => {
  cy.request('POST', 'http://localhost:3003/api/login', {
    username,
    password,
  }).then(({ body }) => {
    localStorage.setItem('loggedBlogAppUser', JSON.stringify(body));
    cy.visit('http://localhost:3000');
  });
});

// Create blog request
Cypress.Commands.add('createBlog', ({ title, author, url }) => {
  const user = JSON.parse(localStorage.getItem('loggedBlogAppUser'));

  cy.request({
    method: 'POST',
    url: 'http://localhost:3003/api/blogs',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${user.token}`,
    },
    body: {
      title,
      author,
      url,
    },
  }).then(() => {
    // Refresh the page for state changes
    cy.visit('http://localhost:3000');
  });
});
