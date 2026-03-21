# CLAUDE.md — SuryaPrajna Project Instructions

## Project Overview

SuryaPrajna (Sanskrit: "Solar Wisdom") is a universal PV scientific skills workspace covering the entire solar energy value chain. Skills follow the open Agent Skills standard (agentskills.io) for compatibility across Claude Code, Cursor, Codex, Gemini CLI, and any LLM agent.

## Repository Structure

```
skills/          → PV domain skills (10 packs), each with SKILL.md
.claude/         → Claude Code integration (skills, commands, agents)
packages/        → Shared packages (connectors, workflow engine, UI)
apps/            → Applications (web, desktop)
knowledge/       → Reference standards and documentation indices
templates/       → Report and datasheet templates
```

## Key Conventions

### Skills
- Every skill lives in `skills/<pack>/<skill-name>/SKILL.md`
- SKILL.md uses YAML frontmatter with: name, version, description, author, license, tags, dependencies
- Skills must be agent-agnostic — no Claude-specific syntax in skill definitions
- Python dependencies go in each skill's requirements or the skill's YAML `dependencies` field
- Keep skills self-contained; shared utilities go in `packages/`

### Agents
- Agent definitions are in `.claude/agents/` and documented in `AGENTS.md`
- Each agent has a Sanskrit name reflecting its domain
- Surya-Orchestrator routes tasks; domain agents handle execution
- Cross-cutting skills (analytics, documentation) can be invoked by any agent

### Code Style
- Python: Follow PEP 8, type hints preferred, docstrings for public functions
- TypeScript/JavaScript: ESLint + Prettier, strict TypeScript where applicable
- File naming: kebab-case for directories and files
- Commit messages: conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)

### Working with PV Data
- Always specify units (W, kWh, W/m², °C, etc.)
- Use SI units as default; support imperial conversion where needed
- Reference IEC standards by number (e.g., IEC 61215, IEC 61730)
- Solar irradiance in W/m², energy in kWh, power in kW or MW
- Temperature coefficients in %/°C or mV/°C

## Common Tasks

### Adding a new skill
1. Create directory: `skills/<pack>/<skill-name>/`
2. Write `SKILL.md` with YAML frontmatter and documentation
3. Add supporting code/templates as needed
4. Register in `SKILLS.md`
5. Link to responsible agent in `AGENTS.md`

### Adding a new skill pack
1. Create `skills/<new-pack>/` directory
2. Add initial skills
3. Add registry section in `SKILLS.md`
4. Define new agent in `AGENTS.md` if needed
5. Update overview table in `SKILLS.md`

### Running skills
- Skills are documentation + code bundles invoked by LLM agents
- Python-based skills: ensure `pvlib`, `numpy`, `pandas`, `matplotlib` are available
- Connectors in `packages/connectors/` handle external service integration

## Dependencies

### Core Python packages
- `pvlib` — Solar energy modeling
- `numpy`, `pandas` — Numerical and data analysis
- `matplotlib`, `plotly` — Visualization
- `scipy` — Scientific computing
- `scikit-learn` — ML for forecasting

### Core Node packages
- `next` — Web application framework
- `typescript` — Type safety
- `tailwindcss` — Styling

## Environment Variables

Required for connectors (not for core skills):
- `PINECONE_API_KEY` — Vector database for knowledge retrieval
- `ZOTERO_API_KEY` — Reference management
- `OPENWEATHER_API_KEY` — Weather data (alternative source)

## References

- Agent Skills Standard: https://agentskills.io
- pvlib documentation: https://pvlib-python.readthedocs.io
- IEC 61215: Design qualification for crystalline silicon PV modules
- IEC 61730: PV module safety qualification
