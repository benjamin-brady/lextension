# AGENTS

## Runtime and Package Manager

- Use Bun for all package management and script execution.
- Use Bunx for one-off CLI execution.
- Do not use npm, npx, pnpm, or yarn in this repository.

## Common Commands

- Install dependencies: `bun install`
- Start development server: `bun run dev`
- Run type checks: `bun run check`
- Build: `bun run build`
- Deploy: `bun run deploy`
- Direct Wrangler invocation: `bunx wrangler deploy`

When I say something like "ship it", commit JUST your changes, push to main and then run `bun run deploy` to deploy to production.

## Commit Messages

Use semantic commit messages. For example:

- `feat: add new agent for data analysis`
- `fix: correct bug in agent response handling`

Always include the ai agent, model, provider details etc in the commit message.
