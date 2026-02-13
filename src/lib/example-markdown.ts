export const EXAMPLE_MARKDOWN = `# Extreme Markdown Example

This document demonstrates the capabilities of the editor, including tables, diagrams, math, and code blocks.

## 1. Tables

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Markdown** | Standard syntax | ✅ Supported |
| **Tables** | GFM Tables | ✅ Supported |
| **Mermaid** | Diagrams & Charts | ✅ Supported |
| **Math** | LaTeX Equations | 🚧 In Progress |
| **Code** | Syntax Highlighting | ✅ Supported |

## 2. Mermaid Diagrams

### Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?};
    B -- Yes --> C[Great!];
    B -- No --> D[Debug];
    D --> B;
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
\`\`\`

### Class Diagram
\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
\`\`\`

## 3. Code Blocks

\`\`\`typescript
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

function greet(user: User): string {
  return \`Hello, \${user.name} (\${user.role})!\`;
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## 4. Task List

- [x] Create document
- [x] Write content
- [ ] Export to PDF
- [ ] Share with team

## 5. Blockquotes

> "The best way to predict the future is to invent it."
>
> — Alan Kay

## 6. Mathematical Equations (if supported)

The quadratic formula is:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## 7. Long Content for Scroll Testing

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC
"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"

`;
