---
command: "/generate-tests"
description: "Generate comprehensive Playwright tests for the application"
---

## Execution Flow

### Phase 1: Analysis
1. Read .claude/tasks/context_session_*.md for current context
2. Analyze application structure and routes
3. Identify critical user paths
4. Check .claude/memory/patterns/ for existing test patterns
5. Review .claude/memory/test-results/ for historical test data

### Phase 2: Test Planning
Invoke playwright-test-engineer agent to create test plan:
```
invoke_agent(
  agent: "playwright-test-engineer",
  context: ".claude/tasks/context_session_*.md",
  task: "Create comprehensive test suite for [features]",
  expect_output: ".claude/doc/playwright-tests-*.md"
)
```

### Phase 3: Test Generation
Based on the plan, generate:

#### E2E Tests
```typescript
// Core user journeys
test.describe('User Authentication Flow', () => {
  test('should allow user to sign up', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');
    
    // Fill form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.welcome')).toBeVisible();
  });
  
  test('should handle login errors', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
});
```

#### Visual Regression Tests
```typescript
test.describe('Visual Consistency', () => {
  const pages = ['/', '/about', '/pricing', '/features'];
  
  for (const path of pages) {
    test(`${path} visual snapshot`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Desktop view
      await expect(page).toHaveScreenshot(`${path.slice(1) || 'home'}-desktop.png`, {
        fullPage: true,
        animations: 'disabled'
      });
      
      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page).toHaveScreenshot(`${path.slice(1) || 'home'}-mobile.png`);
    });
  }
});
```

#### Interaction Tests
```typescript
test.describe('Form Interactions', () => {
  test('should validate form fields', async ({ page }) => {
    await page.goto('/contact');
    
    // Test required fields
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toHaveCount(3);
    
    // Test email validation
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('[name="email"] + .error')).toContainText('valid email');
    
    // Test successful submission
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="message"]', 'Test message');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

#### Accessibility Tests
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Compliance', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });
  
  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Test skip links
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main/);
  });
});
```

### Phase 4: Page Object Creation
Generate maintainable page objects:

```typescript
// .playwright/page-objects/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  // Locators
  readonly emailInput = () => this.page.locator('[name="email"]');
  readonly passwordInput = () => this.page.locator('[name="password"]');
  readonly submitButton = () => this.page.locator('button[type="submit"]');
  readonly errorMessage = () => this.page.locator('.error-message');
  
  // Actions
  async navigate() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
  
  // Assertions
  async expectError(message: string) {
    await expect(this.errorMessage()).toContainText(message);
  }
  
  async expectSuccess() {
    await expect(this.page).toHaveURL('/dashboard');
  }
}
```

### Phase 5: Test Data & Fixtures
Create test data fixtures:

```typescript
// .playwright/fixtures/users.ts
export const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'SecurePass123!'
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass456!'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrong'
  }
};
```

### Phase 6: CI/CD Configuration
Update GitHub Actions workflow:
- Run tests on push/PR
- Parallel execution with sharding
- Screenshot/video artifacts on failure
- Update memory system with results

### Phase 7: Memory Integration
Document patterns and results:
- Save successful test patterns to .claude/memory/patterns/testing/
- Track test coverage trends
- Document flaky tests for investigation
- Create ADRs for testing decisions

## Anti-patterns to Avoid
- ❌ Hardcoded waits (use Playwright's auto-waiting)
- ❌ Brittle selectors (use data-testid attributes)
- ❌ Test interdependence (each test should be isolated)
- ❌ Ignoring accessibility (include a11y tests)
- ❌ Not handling async operations properly

## Success Metrics
- [ ] All critical paths have E2E tests
- [ ] Visual regression baselines established
- [ ] Form validations tested
- [ ] Accessibility compliance verified
- [ ] CI/CD pipeline running tests
- [ ] Test results feeding memory system
- [ ] Page objects created for maintainability