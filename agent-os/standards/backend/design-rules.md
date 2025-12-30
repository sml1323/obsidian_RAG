# Design Rules (General)

Small units:
- Prefer small functions (< ~30–50 lines). Split by responsibility.
- Prefer small classes with 1 clear responsibility.

Boundaries:
- Separate core logic from I/O (files, network, DB).
- Core modules should be testable without external systems.

Errors:
- Fail fast on invalid input.
- Prefer explicit error messages.

Readability:
- Use types where helpful (typing, dataclasses).
- Avoid cleverness. Choose clarity over compact code.

Testing:
- New logic should come with at least one small test or a runnable example.
