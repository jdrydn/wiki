# Don't If, Assert

**Negative space programming** is the practice of defining valid program state by aggressively rejecting invalid state,
rather than branching to handle it. Assertions, guards, and invariants do the work that defensive `if` chains usually do
— and the negative space left behind is your happy path.

<LinkBlock
  title="http-assert-plus"
  href="https://npm.im/http-assert-plus"
  icon="npm" variant="red" />

## tl;dr

```js
// Positive space: handle every case, return something for each
function getUser(id) {
  if (!id) {
    return null;
  }
  if (typeof id !== 'string') {
    return null;
  }

  const user = db.find(id);
  if (!user) {
    return null;
  }
  if (!user.active) {
    return null;
  }

  return user;
}

// Negative space: assert what must be true, then proceed
function getUser(id) {
  assert(typeof id === 'string' && id.length > 0, 'id must be a non-empty string');

  const user = db.find(id);
  assert(user, `user ${id} not found`);
  assert(user.active, `user ${id} is inactive`);

  return user;
}
```

Fewer branches, no silent `null` returns, and a clear contract: if execution reaches the bottom, everything above it is
true.

## Core idea

You don't write code for what's allowed. You write code for what's forbidden, and whatever's left over is allowed by
construction.

| Style              | Approach                                                         |
| ------------------ | ---------------------------------------------------------------- |
| **Positive space** | Enumerate valid cases and handle each one explicitly             |
| **Negative space** | Enumerate invalid cases and reject them; the rest is the program |

## When to reach for it

| Situation                            | Why it fits                                                       |
| ------------------------------------ | ----------------------------------------------------------------- |
| **Preconditions on function inputs** | Callers get a loud error instead of silent `undefined` downstream |
| **Internal invariants**              | Assumptions live in code, not in stale comments                   |
| **Private / internal APIs**          | You control all callers, so throwing is acceptable                |
| **Parsing & deserialisation**        | Reject malformed data at the boundary, trust it everywhere else   |
| **State machines**                   | Assert the current state before every transition                  |

## When NOT to use it

| Situation                                   | Use instead                                           |
| ------------------------------------------- | ----------------------------------------------------- |
| **User input validation**                   | Return structured errors, not crashes                 |
| **Network / IO failures**                   | Expected failures — use `try/catch` or `Result` types |
| **Public APIs & library boundaries**        | Callers deserve typed errors, not assertion traces    |
| **Hot paths where asserts may be stripped** | Never put side effects inside an assertion            |

## Patterns

### Assert preconditions at the top

```ts
function transfer(from: Account, to: Account, amount: number) {
  assert(amount > 0, 'amount must be positive');
  assert(from.balance >= amount, 'insufficient funds');
  assert(from.id !== to.id, 'cannot transfer to self');

  from.balance -= amount;
  to.balance += amount;
}
```

The function body reads as the happy path. The contract is the first three lines.

### Narrow types with assertion functions (TypeScript)

```ts
function assertDefined<T>(value: T | null | undefined, msg: string): asserts value is T {
  if (value == null) {
    throw new Error(msg);
  }
}

const user = users.find((u) => u.id === id);
assertDefined(user, `user ${id} not found`);
// `user` is now typed as `User`, not `User | undefined`
```

### Exhaustiveness via `never`

```ts
type Status = 'pending' | 'active' | 'archived';

function label(status: Status): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'active':
      return '✅';
    case 'archived':
      return '📦';
    default:
      const _exhaustive: never = status;
      throw new Error(`unhandled status: ${_exhaustive}`);
  }
}
```

Adding a fourth variant to `Status` becomes a compile error, not a silent fallthrough at runtime.

### Validate at the boundary, trust within

```ts
function parseConfig(raw: unknown): Config {
  // validate aggressively, throw on anything wrong
}

// Everywhere else, `Config` is trusted absolutely — no re-checking, no optional chaining.
```

## Gotchas

- **Side effects in assertions are a trap** — some toolchains strip asserts in production builds. Node's built-in
  `assert` is always on; custom `assert()` helpers may not be. Know which you're using.
- **Assertion failures are not user-facing errors** — they're for developers. Wrap them at the application boundary so
  users see something sensible.
- **Don't replace input validation with asserts** for anything crossing a trust boundary (HTTP requests, file contents,
  env vars, third-party APIs).
- **Write specific messages** — assertion failures should be debuggable from the stack trace alone, without re-running.
- **Asserts are not error handling** — `try/catch` is for things that can fail. Asserts are for things that _cannot_
  fail unless the program is broken.

## In other languages

### Python — `assert` for invariants

```python
def withdraw(account, amount):
  assert amount > 0, "amount must be positive"
  assert account.balance >= amount, f"insufficient funds: {account.balance} < {amount}"
  account.balance -= amount
```

Note: Python strips `assert` statements when run with `-O`. Use them for internal invariants, never for input validation
or anything with side effects. For untrusted input, raise `ValueError` explicitly.

### Go — guard clauses with early returns

```go
func Transfer(from, to *Account, amount int64) error {
  if amount <= 0 {
    return fmt.Errorf("amount must be positive, got %d", amount)
  }
  if from.Balance < amount {
    return fmt.Errorf("insufficient funds: %d < %d", from.Balance, amount)
  }
  if from.ID == to.ID {
    return errors.New("cannot transfer to self")
  }


  from.Balance -= amount
  to.Balance += amount
  return nil
}
```

Go has no `assert`. The idiom is to reject invalid states at the top with early returns, leaving the happy path
unindented at the bottom — same shape, different mechanism.

### PHP — typed parameters plus guard throws

```php
public function transfer(Account $from, Account $to, int $amount): void {
  if ($amount <= 0) {
    throw new InvalidArgumentException("amount must be positive, got $amount");
  }
  if ($from->balance < $amount) {
    throw new DomainException("insufficient funds");
  }

  $from->balance -= $amount;
  $to->balance   += $amount;
}
```

Type declarations handle the "is it the right shape" checks for free; explicit throws handle the semantic invariants.
SPL exceptions (`InvalidArgumentException`, `DomainException`, `LogicException`) communicate intent.

### Java — `Objects.requireNonNull` and friends

```java
public void transfer(Account from, Account to, long amount) {
    Objects.requireNonNull(from, "from");
    Objects.requireNonNull(to, "to");
    if (amount <= 0) {
        throw new IllegalArgumentException("amount must be positive");
    }
    if (from.balance() < amount) {
        throw new IllegalStateException("insufficient funds");
    }

    from.debit(amount);
    to.credit(amount);
}
```

`Objects.requireNonNull` is the canonical Java negative-space tool — it's a one-liner that throws `NullPointerException`
with a named field, fast-fails at the top of the method, and is idiomatic enough that readers immediately understand the
contract.

## Further reading

- [TigerBeetle TIGER_STYLE](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md) — assertions used
  as a core engineering discipline
- [John Carmack on inlined code](http://number-none.com/blow/john_carmack_on_inlined_code.html) — related thinking on
  control flow and trust
- "Design by Contract" (Bertrand Meyer, Eiffel) — the academic ancestor of preconditions, postconditions, and invariants
