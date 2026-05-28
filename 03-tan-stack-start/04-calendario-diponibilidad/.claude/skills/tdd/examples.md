# TDD Examples

## Scenario 1: Service with Business Logic

**Task**: Build a checkout service that validates cart, calculates totals with discounts, and creates an order.

### Plan

Behaviors to test:

1. Checkout with valid cart creates a confirmed order
2. Checkout with empty cart fails
3. Discounts are applied correctly to the total
4. Out-of-stock items prevent checkout

### Cycle 1 — Tracer bullet: valid checkout

```typescript
// checkout.service.spec.ts
import { checkout } from "./checkout.service";
import { orderRepository } from "./db/order.repository";
import { productRepository } from "#pods/product/db/product.repository";

vi.mock("./db/order.repository");
vi.mock("../product/db/product.repository");

describe("checkout", () => {
  it("creates a confirmed order with valid cart", async () => {
    // Arrange
    vi.spyOn(productRepository, "findByIds").mockResolvedValue([
      { id: "p1", name: "Shirt", price: 25, stock: 10 },
    ]);
    vi.spyOn(orderRepository, "create").mockResolvedValue({ id: "order-1" });

    const cart = { items: [{ productId: "p1", quantity: 2 }] };

    // Act
    const result = await checkout(cart);

    // Assert
    expect(result.status).toStrictEqual("confirmed");
    expect(result.total).toStrictEqual(50);
  });
});
```

```typescript
// checkout.service.ts — minimal to pass
import { orderRepository } from "./db/order.repository";
import { productRepository } from "#pods/product/db/product.repository";

export const checkout = async (cart: Cart) => {
  const products = await productRepository.findByIds(
    cart.items.map((i) => i.productId),
  );

  const total = cart.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const order = await orderRepository.create({ items: cart.items, total });
  return { status: "confirmed" as const, total, orderId: order.id };
};
```

### Cycle 2 — Empty cart fails

```typescript
it("fails with empty cart", async () => {
  const result = await checkout({ items: [] });

  expect(result.status).toStrictEqual("error");
  expect(result.reason).toStrictEqual("empty_cart");
});
```

```typescript
// Add to checkout.service.ts — minimal addition
export const checkout = async (cart: Cart) => {
  if (cart.items.length === 0) {
    return { status: "error" as const, reason: "empty_cart" };
  }
  // ... rest unchanged
};
```

### Cycle 3 — Discounts applied

```typescript
it("applies discount to the total", async () => {
  vi.spyOn(productRepository, "findByIds").mockResolvedValue([
    { id: "p1", name: "Shirt", price: 100, stock: 10 },
  ]);
  vi.spyOn(orderRepository, "create").mockResolvedValue({ id: "order-2" });

  const cart = {
    items: [{ productId: "p1", quantity: 1 }],
    discountRate: 0.2,
  };

  const result = await checkout(cart);

  expect(result.total).toStrictEqual(80);
});
```

### Cycle 4 — Out of stock

```typescript
it("prevents checkout when item is out of stock", async () => {
  vi.spyOn(productRepository, "findByIds").mockResolvedValue([
    { id: "p1", name: "Shirt", price: 25, stock: 0 },
  ]);

  const cart = { items: [{ productId: "p1", quantity: 1 }] };

  const result = await checkout(cart);

  expect(result.status).toStrictEqual("error");
  expect(result.reason).toStrictEqual("out_of_stock");
});
```

### Refactor phase

After all 4 tests are GREEN — extract `calculateTotal` and `validateStock` helpers. Tests stay on `checkout`, helpers are tested transitively.

---

## Scenario 2: Mapper

**Task**: Map a User DB model (with `_id: ObjectId`) to an API model (with `id: string`).

### Cycle 1 — Maps basic fields

```typescript
// user.mapper.spec.ts
import { ObjectId } from "mongodb";
import { mapUserFromDbToApi } from "./user.mapper";

describe("mapUserFromDbToApi", () => {
  it("maps _id to id and preserves fields", () => {
    const objectId = new ObjectId();
    const dbUser = {
      _id: objectId,
      name: "Alice",
      email: "alice@example.com",
      createdAt: new Date("2025-01-15"),
    };

    const result = mapUserFromDbToApi(dbUser);

    expect(result).toStrictEqual({
      id: objectId.toHexString(),
      name: "Alice",
      email: "alice@example.com",
      createdAt: new Date("2025-01-15"),
    });
  });
});
```

```typescript
// user.mapper.ts — minimal
import type * as dbModel from "./db/user.db-model";
import type * as apiModel from "./user.api-model";

export const mapUserFromDbToApi = (user: dbModel.User): apiModel.User => ({
  id: user._id.toHexString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
```

### Cycle 2 — Handles optional fields

```typescript
it("maps optional avatar as undefined when missing", () => {
  const dbUser = {
    _id: new ObjectId(),
    name: "Bob",
    email: "bob@example.com",
    createdAt: new Date(),
    // no avatar field
  };

  const result = mapUserFromDbToApi(dbUser);

  expect(result.avatar).toBeUndefined();
});
```

Even for a small mapper, TDD catches edge cases (optional fields, nulls) that you might skip writing code-first.

---

## Scenario 3: Repository (Integration)

**Task**: Test the user repository against a real MongoDB instance.

TDD defines WHAT to test. For the HOW (mongodb-memory-server setup, test DB lifecycle) → see **testing-architecture** blueprint.

### Cycle 1 — Create and retrieve

```typescript
// user.repository.spec.ts
import { userRepository } from "./user.repository";
// Setup helpers from testing-architecture blueprint
import { setupTestDb, teardownTestDb } from "#test/db-setup";

describe("userRepository", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("creates a user and retrieves it by id", async () => {
    const created = await userRepository.create({
      name: "Alice",
      email: "alice@example.com",
    });

    const found = await userRepository.findById(created.id);

    expect(found).toBeDefined();
    expect(found!.name).toStrictEqual("Alice");
    expect(found!.email).toStrictEqual("alice@example.com");
  });
});
```

Note: the test verifies through the **repository interface** (create → findById), not by querying the DB directly. This is the "verify through interface" principle.

### Cycle 2 — Find by email

```typescript
it("finds a user by email", async () => {
  await userRepository.create({
    name: "Bob",
    email: "bob@example.com",
  });

  const found = await userRepository.findByEmail("bob@example.com");

  expect(found).toBeDefined();
  expect(found!.name).toStrictEqual("Bob");
});

it("returns null for unknown email", async () => {
  const found = await userRepository.findByEmail("unknown@example.com");

  expect(found).toBeNull();
});
```

---

## Scenario 4: API Route

**Task**: Test a Hono route handler for `POST /api/users`.

TDD defines WHAT to test. For the HOW (`app.request()` setup, Hono test patterns) → see **testing-architecture** blueprint.

### Cycle 1 — Successful creation

```typescript
// user.route.spec.ts
import { app } from "./user.route";
import { userRepository } from "./db/user.repository";

vi.mock("./db/user.repository");

describe("POST /api/users", () => {
  it("creates a user and returns 201", async () => {
    vi.spyOn(userRepository, "create").mockResolvedValue({
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
    });

    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
    });

    expect(res.status).toStrictEqual(201);
    const body = await res.json();
    expect(body.id).toStrictEqual("user-1");
    expect(body.name).toStrictEqual("Alice");
  });
});
```

### Cycle 2 — Validation error

```typescript
it("returns 400 when name is missing", async () => {
  const res = await app.request("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alice@example.com" }),
  });

  expect(res.status).toStrictEqual(400);
});
```

### Cycle 3 — Duplicate email

```typescript
it("returns 409 when email already exists", async () => {
  vi.spyOn(userRepository, "create").mockRejectedValue(
    new AppError("DUPLICATE_EMAIL", 409),
  );

  const res = await app.request("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Alice", email: "taken@example.com" }),
  });

  expect(res.status).toStrictEqual(409);
});
```

Note: route tests mock the repository (system boundary = DB) and test HTTP behavior (status codes, response shape). Business logic lives in the service and is tested separately.

---

## Scenario 5: Bug Fix (Regression Test)

**Task**: Users report that checkout accepts negative quantities. Fix with TDD.

### Step 1 — Reproduce with a failing test

```typescript
// checkout.service.spec.ts — add to existing describe
it("rejects items with negative quantity", async () => {
  const cart = { items: [{ productId: "p1", quantity: -3 }] };

  const result = await checkout(cart);

  expect(result.status).toStrictEqual("error");
  expect(result.reason).toStrictEqual("invalid_quantity");
});
```

Run test → RED (currently accepts negative quantities).

### Step 2 — Minimal fix

```typescript
// checkout.service.ts — add validation
export const checkout = async (cart: Cart) => {
  if (cart.items.length === 0) {
    return { status: "error" as const, reason: "empty_cart" };
  }

  const invalidQty = cart.items.some((i) => i.quantity <= 0);
  if (invalidQty) {
    return { status: "error" as const, reason: "invalid_quantity" };
  }

  // ... rest unchanged
};
```

Run test → GREEN. The bug is fixed AND will never regress because the test is permanent.

### Step 3 — Consider related edge cases

```typescript
it("rejects items with zero quantity", async () => {
  const cart = { items: [{ productId: "p1", quantity: 0 }] };

  const result = await checkout(cart);

  expect(result.status).toStrictEqual("error");
  expect(result.reason).toStrictEqual("invalid_quantity");
});
```

---

## Scenario 6: React Component

**Task**: Build a delete button that shows a confirmation dialog before deleting.

TDD defines WHAT to test (user behavior). For the HOW (testing-library, Vitest Browser Mode setup) → see **testing-architecture** blueprint.

### Cycle 1 — Shows confirmation on click

```typescript
// delete-button.browser.spec.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteButton } from "./delete-button";

describe("DeleteButton", () => {
  it("shows confirmation dialog when clicked", async () => {
    const onDelete = vi.fn();
    render(<DeleteButton onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.getByText(/are you sure/i)).toBeVisible();
    expect(onDelete).not.toHaveBeenCalled(); // not yet!
  });
});
```

```tsx
// delete-button.tsx — minimal
import { useState } from "react";

interface DeleteButtonProps {
  onDelete: () => void;
}

export const DeleteButton = ({ onDelete }: DeleteButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>
      {showConfirm && <p>Are you sure?</p>}
    </>
  );
};
```

### Cycle 2 — Confirm triggers delete

```typescript
it("calls onDelete when user confirms", async () => {
  const onDelete = vi.fn();
  render(<DeleteButton onDelete={onDelete} />);

  await userEvent.click(screen.getByRole("button", { name: /delete/i }));
  await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

  expect(onDelete).toHaveBeenCalledOnce();
});
```

### Cycle 3 — Cancel closes dialog

```typescript
it("hides dialog when user cancels", async () => {
  const onDelete = vi.fn();
  render(<DeleteButton onDelete={onDelete} />);

  await userEvent.click(screen.getByRole("button", { name: /delete/i }));
  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
});
```

Note: tests describe **user behavior** (click delete → see confirmation → click confirm → item deleted). They don't test state variables, re-renders, or component internals. If you refactor from `useState` to a state machine, all tests still pass.
