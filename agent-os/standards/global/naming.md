# Naming Standards

Python:
- modules/packages: snake_case
- classes: PascalCase
- functions/variables: snake_case
- constants: UPPER_SNAKE_CASE

Functions:
- verb_noun (e.g., parse_html, fetch_posts, build_prompt)
- avoid generic verbs: do, handle, process, manage
- prefer precise verbs: fetch, parse, validate, build, render, compute

Booleans:
- is_/has_/can_/should_ prefix

Classes:
- Name by responsibility:
  - *Service (use-case coordination)
  - *Repository (persistence boundary)
  - *Client (external API boundary)
  - *Factory (construction/wiring)
  - *Strategy/*Policy (pluggable behavior)
  - *Pipeline (ordered steps runner)

Files:
- named after the main responsibility, not “utils” unless truly generic
