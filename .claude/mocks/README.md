# Visual Mock Directory

Place your design mockups here with descriptive names:
- homepage.png
- dashboard.png
- login-form.png
- header-component.png
- button-states.png

## Naming Convention
Use kebab-case for mock files matching your component names.

## Recommended Formats
- PNG for pixel-perfect comparisons (preferred)
- JPG for general layout comparisons
- Same dimensions as target viewport
- Include mobile, tablet, and desktop versions when needed

## Directory Structure
```
.claude/mocks/
├── components/
│   ├── button-default.png
│   ├── button-hover.png
│   └── button-disabled.png
├── pages/
│   ├── homepage-desktop.png
│   ├── homepage-mobile.png
│   └── dashboard.png
└── responsive/
    ├── header-375w.png
    ├── header-768w.png
    └── header-1920w.png
```

## Usage
Tell Claude: "/visual-iterate homepage" to start matching homepage.png

## Tips
- Use high-quality exports from design tools (Figma, Sketch, XD)
- Ensure mocks match expected viewport dimensions
- Include all component states (hover, active, disabled)
- Name files to match component/page names in code
