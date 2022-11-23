describe('Blog app', function () {
  beforeEach(function () {
    // Reset database via backend api call
    cy.request('POST', 'http://localhost:3003/api/testing/reset');
    // Create a test user
    const user = {
      name: 'Matti Luukkainen',
      password: 'salainen',
      username: 'mluukkai',
    };
    cy.request('POST', 'http://localhost:3003/api/users/', user);

    cy.visit('http://localhost:3000');
  });

  it('Login form is shown', function () {
    cy.contains('Log in to application');
    cy.get('form#login').should('be.visible');
    cy.get('#username-input').should('be.visible');
    cy.get('#password-input').should('be.visible');
    cy.get('#login-button').should('be.visible');
  });

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.get('#username-input').type('mluukkai');
      cy.get('#password-input').type('salainen');
      cy.get('#login-button').click();

      // After successful login
      cy.contains('Matti Luukkainen logged in');
      cy.contains('logout');
    });

    it('fails with wrong credentials', function () {
      cy.get('#username-input').type('mluukkai');
      cy.get('#password-input').type('incorrectPassword');
      cy.get('#login-button').click();

      cy.get('.message')
        .should('contain', 'invalid username or password')
        .and('have.css', 'border-style', 'solid');
      cy.get('html').should('not.contain', 'Matti Luukkainen logged in');
    });
  });

  describe('When user is logged in', function () {
    beforeEach(function () {
      // Log in user with created command
      cy.login({ username: 'mluukkai', password: 'salainen' });
    });

    it('New blog can be created', function () {
      cy.contains('CREATE NEW BLOG').click();
      cy.get('input#title').type('Test blog');
      cy.get('input#author').type('author cypress');
      cy.get('input#url').type('www.cypress.com');
      cy.get('#create-button').click();
      cy.get('.message').contains(
        'A new blog: Test blog by author cypress has been added',
      );
    });

    it('After logout login form is displayed again', function () {
      // After successful login
      cy.contains('Matti Luukkainen logged in');
      // Click logout button
      cy.get('#logout-button').click();
      cy.contains('Log in to application');
      cy.get('form#login').should('be.visible');
    });

    describe('And 3 blogs have been added', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'First blog',
          author: 'Author 1',
          url: 'www.test1.com',
        });
        cy.createBlog({
          title: 'Second blog',
          author: 'Author 2',
          url: 'www.test2.com',
        });
        cy.createBlog({
          title: 'Third blog',
          author: 'Author 3',
          url: 'www.test3.com',
        });
      });

      it('A blog can be liked', function () {
        // Get the First blog
        cy.contains('.accordion', 'First blog').within(() => {
          // Click on the "Show" button
          cy.get('#toggle-button').click();
          // Likes are 0 by default
          cy.contains('Likes:');
          cy.contains('.blog-likes', '0');
          cy.get('#like-button').click();
          // Likes have been increased to 1
          cy.contains('.blog-likes', '1');
        });
      });

      it('Blogs will be sorted by likes', function () {
        // The Third blog will get 2 likes
        cy.contains('.accordion', 'Third blog').within(() => {
          cy.get('#toggle-button').click();

          // Click Like button 2 times
          cy.get('#like-button').click();
          cy.contains('.blog-likes', '1');
          cy.get('#like-button').click();
          cy.contains('.blog-likes', '2');
        });

        // The First blog will get 1 like
        cy.contains('.accordion', 'First blog').within(() => {
          cy.get('#toggle-button').click();

          // Click Like button 2 times
          cy.get('#like-button').click();
          cy.contains('.blog-likes', '1');
        });

        // Refresh the page
        cy.visit('http://localhost:3000');

        // Third blog must be on first, next First blog
        cy.get('.accordion').eq(0).should('contain', 'Third blog');
        cy.get('.accordion').eq(1).should('contain', 'First blog');
      });

      it('A blog can be removed by the person who created it', function () {
        cy.contains('.accordion', 'Second blog').within(() => {
          cy.get('#toggle-button').click();
          // Click the delete button
          cy.get('#delete-button').click();
          // Expect a Confirm and accept it
          cy.on('window:confirm', (text) => {
            expect(text).to.contains(
              'Are you sure you want to delete this blog?',
            );
          });
        });

        // Second blog should not appear
        cy.get('html').should('not.contain', 'Second blog');
        cy.get('.message').contains('The blog was removed successfully');
      });

      // There is probably a better way to do this test
      it('A blog cannot be deleted if the person did not create it', function () {
        // Logout current user
        cy.get('#logout-button').click();

        // Create another user
        const user = {
          name: 'John Smith',
          username: 'johnsmith',
          password: 'smith',
        };
        cy.request('POST', 'http://localhost:3003/api/users/', user);

        // Login with the new user
        cy.login({ username: 'johnsmith', password: 'smith' });

        // The blogs previously created should not have the "Delete" button
        cy.contains('.accordion', 'First blog').within(() => {
          cy.get('#toggle-button').click();
          cy.should('not.contain', '#delete-button');
        });
      });
    });
  });
});
