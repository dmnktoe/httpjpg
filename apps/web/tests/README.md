# E2E Testing with Playwright

End-to-end tests for the httpjpg.com web application.

## 📋 Test Suites

### Homepage Tests (`homepage.spec.ts`)
- Page loading and basic rendering
- Main content visibility
- Responsive design across viewports
- Console error monitoring

### Navigation Tests (`navigation.spec.ts`)
- Navigation between pages
- 404 error handling
- Mobile menu functionality

### Accessibility Tests (`accessibility.spec.ts`)
- Heading hierarchy
- Image alt texts
- Keyboard navigation
- ARIA labels on interactive elements

## 🚀 Running Tests

### Local Development

```bash
# Run all tests (starts dev server automatically)
pnpm run test:e2e

# Run tests with UI mode (interactive)
pnpm run test:e2e:ui

# Debug tests
pnpm run test:e2e:debug

# Run specific test file
pnpm exec playwright test homepage.spec.ts

# Run tests in headed mode (see browser)
pnpm exec playwright test --headed
```

### CI/CD

Tests run automatically in GitHub Actions after the build step. The CI:
- Uses production build (`pnpm run start`)
- Runs only on Chromium for speed
- Uploads test reports on failure
- Blocks merge if tests fail

## 📊 Test Reports

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

## 🛠 Configuration

Tests are configured in `playwright.config.ts`:
- **Local**: Uses dev server on `localhost:3000` (reuses existing server)
- **CI**: Starts production server from build artifacts
- **Retries**: 0 locally, 2 on CI
- **Workers**: All available locally, 1 on CI
- **Browsers**: Chromium only (can enable Firefox/WebKit if needed)

## 📝 Writing Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    const element = page.locator('selector');
    await expect(element).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors**: Prefer `getByRole()`, `getByText()`, `getByLabel()`
2. **Wait for navigation**: Use `await expect(...).toBeVisible()` instead of timeouts
3. **Test user flows**: Focus on critical paths users take
4. **Keep tests isolated**: Each test should work independently
5. **Handle dynamic content**: Use proper waits for async data

## 🔍 Debugging

```bash
# Debug with Playwright Inspector
pnpm run test:e2e:debug

# Run with trace on
pnpm exec playwright test --trace on

# View trace
pnpm exec playwright show-trace trace.zip
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
