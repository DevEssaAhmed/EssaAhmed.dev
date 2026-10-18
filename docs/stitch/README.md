# Stitch source of truth

The current design source is the private Stitch project **Essa Ahmed — Modern Framer / Vercel Developer Portfolio** (`projects/10712900675103806638`) and its **Obsidian Kinetic** design system (`assets/fa5f7e1c78d24fa2b3ed92fca6fdc6ce`). Use the MCP project for current screens and tokens.

The checked-in `screen.html` and `screen.png` are an earlier export. They use the retired champagne / slate palette and contain old sample project copy. Keep them only as history; they are not implementation references.

The public implementation on the current branch covers Home, Projects, Project Detail, About, Articles, Article Detail, Travel, and Diary, with responsive layouts. The Stitch project catalog currently exposes only the existing v2 reference screens; mobile About, Articles, Diary, and the detail-route references are still missing from that catalog.

Screen-generation/edit calls returned output during this pass, but the generated screens did not appear in the project screen listing, so they are not treated as saved references. Further Stitch inspection and edits are blocked until the Stitch MCP connection is reauthenticated: its approval check reports that the access token cannot be refreshed after the account changed. Do not bypass that check. After reconnecting, add and verify the missing mobile and detail screens against the current implementation and the Obsidian Kinetic system.
