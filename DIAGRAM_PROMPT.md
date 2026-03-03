# Mermaid-Diagramm mit Claude Code generieren

> Extrahiert aus der [GitDiagram](https://github.com/ahmedkhaleel2004/gitdiagram) 3-Stufen-Pipeline, konsolidiert und optimiert fuer Claude Code.

---

## Schnellstart

```bash
# Im Root-Verzeichnis des Projekts:
claude "$(cat DIAGRAM_PROMPT.md)"
```

---

## Der Prompt

````
You are a principal software engineer creating a system-design diagram for this repository.

<task>
Analyze this repository and produce a single, valid Mermaid.js architecture diagram.
Write the result to `ARCHITECTURE.mmd` (raw Mermaid code, no markdown fences).
</task>

Work through these three phases. Do your analysis internally — only output the final Mermaid code.

## Phase 1 — Repository Analysis

Gather context:
1. Read the file tree. Exclude irrelevant directories: `.git`, `node_modules`, `dist`, `build`, `.next`, `__pycache__`, `.venv`, `vendor`, `target`, `.idea`, `.vscode`.
2. Read the README (or similar: docs/*, CONTRIBUTING.md).
3. Skim key config files (package.json, pyproject.toml, Cargo.toml, go.mod, docker-compose.yml, Makefile, etc.) to identify the tech stack.

From this, determine:
- **Project type**: full-stack app, CLI tool, library, compiler, microservices, monorepo, mobile app, data pipeline, etc.
- **Main components**: frontend, backend, API gateway, database, cache, message queue, workers, external services, CI/CD, etc.
- **Relationships**: data flow, API calls, event buses, dependency direction.
- **Architecture patterns**: MVC, hexagonal, CQRS, layered, plugin-based, etc.

## Phase 2 — Component Mapping

Map each identified component to its concrete file or directory in the repo:

<rules>
- Only map components where a clear match exists.
- Prefer directories for modules/layers, specific files for entry points or configs.
- Use exact paths as they appear in the file tree.
- Aim for 10–30 mappings. More is better, but only if accurate.
</rules>

## Phase 3 — Mermaid Diagram Generation

Generate valid Mermaid.js code following these specifications:

<diagram_structure>
- Use `flowchart TD` (top-down).
- Orient the diagram VERTICALLY. Avoid long horizontal chains of nodes.
- Group related components in `subgraph` blocks.
- Use appropriate shapes:
  - `("Label")` — rounded rectangle for services/components
  - `[("Label")]` — cylinder for databases
  - `["Label"]` — rectangle for generic modules
  - `{{"Label"}}` — hexagon for external services
  - `(["Label"])` — stadium for queues/caches
- Show data flow with labeled arrows: `A -->|"description"| B`
- Not every arrow needs a label — only add labels that convey meaningful information.
- Cap complexity: aim for 15–35 nodes. For large repos, group sub-components into a single subgraph node rather than showing every file.
</diagram_structure>

<click_events>
- Add `click NodeID "path/to/file_or_dir"` for every mapped component.
- Use relative paths only. Never full URLs.
- Paths must NOT appear in visible node labels — only in click events.
- Example: `click API "src/api/routes.ts"`
</click_events>

<styling>
Colors are MANDATORY. Define classDef styles and apply them to every node.

Suggested palette (adapt to project):
  classDef frontend fill:#42b883,stroke:#35495e,color:#fff
  classDef backend fill:#3178c6,stroke:#265a8f,color:#fff
  classDef database fill:#336791,stroke:#264d73,color:#fff
  classDef cache fill:#dc382c,stroke:#a02a22,color:#fff
  classDef queue fill:#ff6600,stroke:#cc5200,color:#fff
  classDef external fill:#ff6347,stroke:#cc4f39,color:#fff
  classDef infra fill:#7b42bc,stroke:#5e338f,color:#fff
  classDef testing fill:#f0ad4e,stroke:#c49038,color:#000
</styling>

<syntax_rules>
CRITICAL — the Mermaid parser is strict. Violating any of these produces a parse error:

1. QUOTE all labels containing special characters ( ) / . : & etc.
   WRONG:  `EX[/api/process (Backend)]:::api`
   RIGHT:  `EX["/api/process (Backend)"]:::api`

2. QUOTE all edge labels containing special characters:
   WRONG:  `A -->|calls Process()| B`
   RIGHT:  `A -->|"calls Process()"| B`

3. NO spaces between pipes and quotes in edge labels:
   WRONG:  `A -->| "text" | B`
   RIGHT:  `A -->|"text"| B`

4. NO :::class on subgraph declarations:
   WRONG:  `subgraph "Frontend":::frontend`
   RIGHT:  `subgraph "Frontend"`  (apply styles to nodes inside)

5. NO subgraph aliases:
   WRONG:  `subgraph FE "Frontend"`
   RIGHT:  `subgraph "Frontend"`

6. NO `%%{init: ...}%%` blocks. Omit entirely.

7. NEVER use `end` as a node ID — it is a reserved keyword.
   WRONG:  `end["End Node"]`
   RIGHT:  `EndNode["End Node"]`

8. Node IDs must NOT start with a digit:
   WRONG:  `1A["First"]`
   RIGHT:  `A1["First"]`

9. NO semicolons at line ends.

10. NO empty subgraphs — every subgraph must contain at least one node.

11. NO nested quotes. If a label needs quotes inside, rephrase:
    WRONG:  `A["He said "hello""]`
    RIGHT:  `A["He said hello"]`
</syntax_rules>

<self_check>
Before writing the file, mentally verify:
- [ ] Every node has a classDef applied
- [ ] Every label with special chars is quoted
- [ ] Every edge label has no spaces between pipes and quotes
- [ ] No subgraph has :::class or an alias
- [ ] No node ID is `end` or starts with a digit
- [ ] No %%{init} block
- [ ] Diagram is predominantly vertical
- [ ] 15–35 nodes (not too sparse, not unreadable)
- [ ] Click events use relative paths, not visible in labels
</self_check>

<output_template>
flowchart TD
    %% External actors
    User("User/Client"):::external

    subgraph "Frontend"
        FE1("Component A"):::frontend
        FE2("Component B"):::frontend
    end

    subgraph "Backend"
        BE1("Service X"):::backend
        BE2("Service Y"):::backend
    end

    subgraph "Data Layer"
        DB[("PostgreSQL")]:::database
        Cache(["Redis Cache"]):::cache
    end

    %% Connections
    User -->|"HTTP"| FE1
    FE1 --> FE2
    FE1 -->|"REST API"| BE1
    BE1 -->|"Query"| DB
    BE1 -->|"Cache lookup"| Cache

    %% Click Events
    click FE1 "src/components/A"
    click FE2 "src/components/B"
    click BE1 "src/services/X.ts"
    click BE2 "src/services/Y.ts"

    %% Styles
    classDef frontend fill:#42b883,stroke:#35495e,color:#fff
    classDef backend fill:#3178c6,stroke:#265a8f,color:#fff
    classDef database fill:#336791,stroke:#264d73,color:#fff
    classDef cache fill:#dc382c,stroke:#a02a22,color:#fff
    classDef external fill:#ff6347,stroke:#cc4f39,color:#fff
</output_template>
````

---

## Verwendung

### Direkt in Claude Code

```bash
# Im Root-Verzeichnis des Projekts:
claude "$(cat DIAGRAM_PROMPT.md)"

# Oder interaktiv:
claude
> Lies DIAGRAM_PROMPT.md und fuehre die Anweisungen darin aus.
```

### Als CLAUDE.md-Anweisung

Fuege folgendes zu deiner `CLAUDE.md` hinzu:

```markdown
## Diagramm-Generierung

Wenn der User ein Architektur-Diagramm anfragt, befolge die Anweisungen
in `DIAGRAM_PROMPT.md`. Schreibe das Ergebnis nach `ARCHITECTURE.mmd`.
```

### Ausgabe validieren

```bash
npx @mermaid-js/mermaid-cli mmdc -i ARCHITECTURE.mmd -o ARCHITECTURE.svg
```

Falls Syntax-Fehler auftreten:

```
Der Mermaid-Code in ARCHITECTURE.mmd hat folgenden Parser-Fehler:
<error hier einfuegen>

Behebe den Syntax-Fehler, ohne die Diagramm-Bedeutung zu aendern.
Behalte alle Click-Events und die vertikale Orientierung bei.
Gib nur den korrigierten Mermaid-Code zurueck.
```

---

## Optimierungen gegenueber GitDiagram

| Aspekt | GitDiagram (Original) | Dieser Prompt |
|---|---|---|
| LLM-Aufrufe | 3 separate Calls | 1 konsolidierter Prompt |
| Repo-Zugriff | File-Tree + README als String | Claude Code liest direkt |
| Sprache | Englisch (Prompt) | Englisch (bessere Ergebnisse) |
| Steuerung | Freitext-Anweisungen | XML-Tags (`<rules>`, `<syntax_rules>`, etc.) |
| Validierung | Externer Mermaid-Validator + Fix-Loop | Self-Check im Prompt + optionaler Validator |
| Skalierung | Keine Begrenzung | 15–35 Nodes Cap gegen Ueberladung |
| Syntax-Regeln | 5 Regeln | 11 Regeln (+ `end`-Keyword, Ziffern-IDs, Semikolons, leere Subgraphs, verschachtelte Quotes) |
| Datei-Filter | Keiner | Explizite Exclude-Liste fuer irrelevante Dirs |
