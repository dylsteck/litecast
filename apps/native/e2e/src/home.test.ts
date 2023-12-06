import { by, element, expect } from 'detox';

describe('Home screen', () => {
  it('"Sign In" button should be visible', async () => {
    await expect(element(by.id('signInButton'))).toBeVisible();
  });

  it('Show screen has bottom navigation after tapping "Sign In"', async () => {
    await element(by.id('signInButton')).tap();
    await expect(element(by.id('homeTabScreen'))).toBeVisible();
  });
});
