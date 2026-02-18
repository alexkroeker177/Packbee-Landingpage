# Testing Patterns

**Analysis Date:** 2026-02-18

## Test Framework

**Status:** No test framework detected in this codebase.

**Investigation:**
- No `jest.config.js`, `vitest.config.ts`, `playwright.config.ts` files found
- No test dependencies in `package.json`: No jest, vitest, playwright, testing-library, or related packages
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx` files found in codebase
- No `.github/workflows/` CI configuration for testing
- `.github/` directory not present

**Runner:** Not applicable

**Assertion Library:** Not applicable

**Run Commands:**
```bash
npm run dev      # Dev server only (no tests)
npm run build    # Production build only
npm run start    # Start production server
npm run lint     # ESLint only (no tests)
```

## Testing Philosophy

This is a **landing page** codebase with no test coverage. The project is:
- Focused on visual presentation and interactive UI
- Using component libraries (Framer Motion, GSAP, Lucide icons) with built-in reliability
- Deployed as static/generated Next.js pages (no critical business logic to test)
- Animation-heavy (GSAP scroll triggers, Framer Motion transitions) — difficult to unit test without Playwright E2E

**Testing approach if needed:**
- E2E tests would be most valuable (Playwright) for animation timings and responsive behavior
- Visual regression tests for CSS/animation consistency across browser versions
- Unit tests not needed for presentational components without complex logic
- Storybook not present; component library focus is minimal

## Test File Organization

**Not applicable** — no test files in codebase.

**Recommendation if implementing tests:**
- Co-locate test files with components: `components/Hero/__tests__/Hero.test.tsx` or `Hero.test.tsx` alongside `Hero.tsx`
- E2E tests in dedicated `e2e/` directory at root: `e2e/navigation.spec.ts`, `e2e/animations.spec.ts`
- Shared test utilities in `lib/testing/`

## Test Structure

**Not applicable** — no test files in codebase.

**Example pattern if implemented (based on code structure):**
```typescript
// components/__tests__/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '../Navbar';

describe('Navbar', () => {
  it('should toggle mobile menu on button click', async () => {
    render(<Navbar />);
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(menuButton);
    expect(screen.getByRole('navigation')).toBeVisible();
  });
});
```

## Mocking

**Not applicable** — no test framework or mocking strategy in use.

**What would be mocked if tests existed:**
- **Next.js Image component**: Use `jest.mock('next/image')` or mock implementation
- **GSAP animations**: Mock `gsap.context()`, `ScrollTrigger` to avoid DOM manipulation in tests
- **Window methods**: Mock `matchMedia()` for `useMediaQuery` hook testing
- **API calls**: Not applicable (no API integration in landing page)
- **External images**: Mock image URLs or use placeholder services (`picsum.photos`, `ui-avatars.com`)

## What NOT to Mock

- React components that compose the page (render full component tree for integration testing)
- CSS/Tailwind utilities (animation/styling is part of tested behavior)
- Custom hooks (`useInterval`, `useMediaQuery`) without good reason; test their effects instead

## Fixtures and Factories

**Test Data Present in Code:**
- `DEMO_ORDER` in `components/packing-prototype/demo-data.ts` — demo order with items
- `DEFAULT_ADDRESS` in `components/packing-prototype/PackingPrototype.tsx` — sample shipping address
- Features array in `FeaturesCreative.tsx` — feature cards with content
- Color palettes in `app/globals.css` — 3 switchable design tokens

**If tests were written, fixtures would live in:**
- `lib/testing/fixtures/orders.ts` — mock order data
- `lib/testing/fixtures/addresses.ts` — mock address data
- `lib/testing/fixtures/features.ts` — mock feature content

## Coverage

**Requirements:** None enforced

**Linting coverage:** ESLint runs but no coverage reporting configured

**View Coverage:** N/A (not implemented)

## Test Types

### Unit Tests
**Not implemented.** If added:
- Test pure utility functions: `getCSSVar()`, `cn()`, `mod()`
- Test custom hooks: `useInterval()`, `useMediaQuery()`
- Test prop handling in sub-components: `FeatureCard`, `CarouselControls`
- **Scope**: Isolated function behavior, no DOM or external dependencies

### Integration Tests
**Not implemented.** If added:
- Test component interaction: Navbar menu toggle opens/closes
- Test state changes: Carousel advances to next/previous slide
- Test prototype interaction: Scanning items updates UI
- **Scope**: Multiple components working together, actual DOM rendering, user interactions

### E2E Tests
**Not implemented but most valuable.** If added:
- Test scroll animations trigger correctly at viewport positions
- Test responsive behavior on mobile/tablet/desktop
- Test animation timing and visual sequencing
- Test interactive prototypes (packing prototype scans, carousel rotation)
- **Framework**: Playwright (modern choice for Next.js projects)
- **Config file**: `playwright.config.ts` (not present)

**Example if implemented:**
```typescript
// e2e/animations.spec.ts
import { test, expect } from '@playwright/test';

test('Hero section expands background on scroll', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-testid="hero"]');
  await expect(hero).toBeVisible();

  // Scroll and check animation state
  await page.evaluate(() => window.scrollBy(0, 500));
  const bgMask = page.locator('[data-testid="hero-mask"]');
  const mask = await bgMask.evaluate(el =>
    getComputedStyle(el).clipPath
  );
  expect(mask).toContain('ellipse(150%');
});
```

## Code Characteristics for Testing

**Testable aspects:**
- Components are modular and single-responsibility
- Custom hooks (`useMediaQuery`, `useInterval`) are exported and reusable
- Utility functions (`getCSSVar`, `cn`) are pure and easily testable
- State logic is isolated in components (no external dependencies to mock)

**Difficult to test without E2E:**
- GSAP animations and scroll triggers
- CSS-based visual changes (backgrounds, colors, transforms)
- Responsive breakpoint behavior
- Complex animation timings and sequences

**Missing test infrastructure:**
- No test runner configured
- No testing library packages installed
- No test configuration files
- No fixtures or test utilities
- No CI/CD pipeline for running tests

## Recommendation for Adding Tests

**Priority order:**
1. **E2E tests first** — Playwright for animation, responsive, and interaction testing (highest ROI for landing page)
2. **Custom hook tests** — Unit tests for `useMediaQuery`, `useInterval` to catch regressions
3. **Utility tests** — Unit tests for `getCSSVar`, `cn`
4. **Component integration tests** — If UI state logic becomes complex

**Setup steps if implementing:**
```bash
# Install dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom testing-library/user-event

# E2E testing
npm install --save-dev @playwright/test

# Create config files
touch vitest.config.ts playwright.config.ts

# Create test directories
mkdir -p __tests__ e2e lib/testing
```

**Start with single test file:**
- `__tests__/hooks/useMediaQuery.test.ts` — Verify breakpoint detection works
- `e2e/navbar.spec.ts` — Verify mobile menu toggle works on viewport changes
- `__tests__/utils.test.ts` — Verify utility functions work correctly

---

*Testing analysis: 2026-02-18*

**Note:** This is a landing page with no test infrastructure. The codebase prioritizes visual design and animation over business logic. Consider adding E2E tests before unit tests if testing is needed.
