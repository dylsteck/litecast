describe('Home screen', () => {
  it('"Home" title should be visible in app header component', () => {
    cy.visit('/');
    cy.get('[data-testid="appHeader"]').should('have.text', 'Home');
  });
});

export {};
