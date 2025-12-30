# Pattern Practice Rules

Use patterns only when they improve:
- swapping behavior (Strategy)
- fixed workflow with customizable steps (Template Method)
- config-driven construction (Factory)

Avoid "pattern for pattern's sake".

## Strategy
Use when there are 2+ interchangeable policies/algorithms.
Rules:
- No if/elif branches scattered in business logic to choose algorithms.
- Prefer Protocol/ABC + dependency injection.
- Strategy interface should be small (1–2 methods).
- Selection happens in wiring/factory layer.

## Template Method
Use when you have an invariant sequence of steps.
Rules:
- Base.run() defines the order; subclasses override step hooks.
- Each step must be a small method (testable).
- Keep run() short and readable.

## Factory
Use when object creation depends on config/env/flags.
Rules:
- Centralize construction & config parsing.
- Call sites should depend on interfaces, not concrete classes.
- Factory contains no business logic; only wiring.
