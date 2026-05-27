# TDD Reference

## Good vs Bad Tests

### Good tests

Test through **public interfaces**, describe **behavior**, survive **refactors**.

```typescript
// GOOD: Tests observable behavior through public API
it("creates a confirmed order with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toStrictEqual("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

### Bad tests

Coupled to **implementation details** — break on refactor even when behavior is unchanged.

```typescript
// BAD: Tests implementation details
it("calls paymentService.process on checkout", async () => {
  vi.spyOn(paymentService, "process");
  await checkout(cart, payment);
  expect(paymentService.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators (not system boundaries)
- Testing private methods
- Asserting on call counts/order of internal calls
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT

### Verify through the interface

```typescript
// BAD: Bypasses interface to verify
it("saves user to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
it("makes user retrievable after creation", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toStrictEqual("Alice");
});
```

---

## Mocking Strategy

### Default: `vi.spyOn`

Mock at module boundaries without dependency injection overhead:

```typescript
import { stripeClient } from "#lib/stripe";

// spy on the exported object's method
vi.spyOn(stripeClient, "charge").mockResolvedValue({ success: true });
```

### When to use DI instead

DI only when it genuinely adds value — not for testability alone:

- Abstracting an interchangeable provider (e.g., payment gateway that could be Stripe or PayPal)
- Plugin architectures where implementations are swapped at runtime
- Libraries consumed by external users who need to inject their own dependencies

### What to mock (system boundaries only)

| Mock                                          | Don't mock                       |
| --------------------------------------------- | -------------------------------- |
| External APIs (payment, email, SMS)           | Your own modules' internal calls |
| Database calls (prefer test DB when possible) | Mappers, utils, helpers          |
| Time (`vi.useFakeTimers`)                     | Internal state                   |
| Randomness (`vi.spyOn(Math, "random")`)       | Functions you control            |
| Environment variables                         | Constants                        |

### Mocking anti-patterns

- **Over-mocking**: if you mock 5+ things in one test, the test is probably testing nothing real
- **Mock-and-assert**: mocking a dependency and then asserting it was called is testing wiring, not behavior
- **Implementation lock-in**: mocking internal calls means any refactor breaks tests even when behavior is preserved

For Vitest mocking recipes (`vi.mock`, `vi.spyOn`, module mocks) → see **testing-architecture** blueprint.

---

## Test Environments

| Type                    | Environment                     | Examples                                    |
| ----------------------- | ------------------------------- | ------------------------------------------- |
| Pure logic              | `node`                          | mappers, utils, services, validators        |
| Code using browser APIs | `browser` (Vitest Browser Mode) | helpers with localStorage, fetch, navigator |
| React components        | `browser` (Vitest Browser Mode) | UI + interaction                            |
| E2E                     | Playwright                      | Full user flows (separate skill)            |

Rule: **needs the browser? → use the real browser. Doesn't? → `node`.** No jsdom.

For Vitest environment configuration → see **testing-architecture** blueprint.

---

## Design Principles for Testability

### Return results over side effects

```typescript
// Easy to test — assert on return value
const calculateDiscount = (cart: Cart): Discount => {
  // ...
  return { amount, type };
};

// Harder to test — need to inspect mutated state
const applyDiscount = (cart: Cart): void => {
  cart.total -= discount;
};
```

### Small surface area

- Fewer exported functions = fewer tests needed
- Fewer parameters = simpler test setup
- Hide complexity inside the module (deep modules)

A module with 3 public methods and rich internal logic is better than one with 15 thin pass-through methods. Each public method needs tests; internal logic is covered transitively.

---

## Refactoring Candidates

After getting to GREEN, look for these patterns before moving to the next test:

### Duplication → Extract function

```typescript
// BEFORE: duplicated price calculation
const getOrderTotal = (items: Item[]) => {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity * (1 - item.discount);
  }
  return total;
};

const getCartPreview = (items: Item[]) => {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity * (1 - item.discount);
  }
  return { total, itemCount: items.length };
};

// AFTER: extract shared logic
const calculateItemTotal = (item: Item) =>
  item.price * item.quantity * (1 - item.discount);

const sumItems = (items: Item[]) =>
  items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

const getOrderTotal = (items: Item[]) => sumItems(items);

const getCartPreview = (items: Item[]) => ({
  total: sumItems(items),
  itemCount: items.length,
});
```

### Long function → Extract helpers (keep tests on public interface)

```typescript
// BEFORE: 40-line function doing too much
const processCheckout = async (cart: Cart, payment: PaymentMethod) => {
  // validate cart (10 lines)
  // calculate totals with discounts (10 lines)
  // process payment (10 lines)
  // create order record (10 lines)
};

// AFTER: broken into focused private helpers
const validateCart = (cart: Cart) => {
  /* ... */
};
const calculateTotals = (cart: Cart) => {
  /* ... */
};

const processCheckout = async (cart: Cart, payment: PaymentMethod) => {
  validateCart(cart);
  const totals = calculateTotals(cart);
  const charge = await paymentClient.charge(totals.final, payment);
  return createOrder(cart, charge);
};

// Tests stay on processCheckout — helpers are tested transitively
```

### Feature envy → Move logic to where data lives

```typescript
// BEFORE: checkout knows too much about cart internals
const checkout = (cart: Cart) => {
  const expired = cart.items.filter((i) => i.addedAt < Date.now() - 3600000);
  if (expired.length > 0)
    cart.items = cart.items.filter((i) => !expired.includes(i));
  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  // ...
};

// AFTER: cart owns its own logic
// cart.ts
const removeExpired = (cart: Cart): Cart => ({
  ...cart,
  items: cart.items.filter(/*...*/),
});
const getTotal = (cart: Cart): number =>
  cart.items.reduce((s, i) => s + i.price * i.qty, 0);

// checkout.ts
const checkout = (cart: Cart) => {
  const cleanCart = removeExpired(cart);
  const total = getTotal(cleanCart);
  // ...
};
```

### Primitive obsession → Introduce value objects

```typescript
// BEFORE: money as raw number
const applyDiscount = (price: number, discount: number): number =>
  price - price * discount;

// AFTER: Money type prevents mixing currencies, wrong decimals
type Money = { amount: number; currency: string };

const applyDiscount = (price: Money, discountRate: number): Money => ({
  amount: price.amount * (1 - discountRate),
  currency: price.currency,
});
```

### Rules for safe refactoring

1. **Never refactor while RED** — get to GREEN first
2. **Run tests after each refactor step** — catch regressions immediately
3. **Keep tests on public interface** — extracted helpers are tested transitively through public functions
4. **If refactor reveals missing tests** — add them as new RED-GREEN cycles, don't refactor and add tests simultaneously
