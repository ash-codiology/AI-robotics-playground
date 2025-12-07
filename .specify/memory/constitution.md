<!-- Sync Impact Report:
Version change: None -> 1.0.0
List of modified principles: None
Added sections: Key Standards, Content Standards, Constraints, Success Criteria
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md: ⚠ pending
- .specify/templates/spec-template.md: ⚠ pending
- .specify/templates/tasks-template.md: ⚠ pending
- .specify/templates/commands/*.md: ⚠ pending
- README.md: ⚠ pending
- docs/quickstart.md: ⚠ pending
Follow-up TODOs: None
-->
# AI/Spec-Driven Book Creation using Docusaurus, Spec-Kit Plus, and Claude Code Constitution

## Core Principles

### AI-Native Writing Workflow
All content is generated, structured, or refined using Spec-Kit Plus + Claude Code.

### Consistency of Style & Voice
The entire book must maintain the same tone, formatting standards, glossary, and writing style across all chapters.

### Technical Clarity
Explanations should be clear enough for beginners but precise enough for intermediate developers.

### Modular Documentation
Each chapter must be standalone, linkable, and reusable.

### Truthfulness
All facts about tools, technologies, and workflows must be accurate and up-to-date.

## Key Standards

### Writing Format
- Markdown (MDX) compatible with Docusaurus
- Headings follow Docusaurus structure (H1 → H6)
- Code examples validated before insertion

### Style & Voice
- Concise, clean, and tutorial-first
- Use simple English—avoid unnecessary jargon
- Bullet points > long paragraphs

### Documentation Practices
- All commands must be runnable
- All steps must be reproducible
- Include tips, warnings, best practices

## Content Standards

### Book Requirements
- Chapters: Minimum 8, preferred 10–12
- Each chapter ends with:
    - Summary
    - Key takeaways
    - Practical example
- Include diagrams (ASCII or Mermaid) where needed

### Sources and Verification
- Tool references must link to official documentation
- No outdated commands or APIs
- AI-generated content must be validated manually

### No Plagiarism
- 100% original writing required
- Paraphrase instead of copying from websites

## Constraints

### Book Length
12,000–20,000 words total

### Tools Required
- Spec-Kit Plus
- Claude Code
- Docusaurus latest version
- GitHub Pages for deployment

### Project Structure
- Must follow Spec-Kit Plus templates
- Each chapter stored in its own folder
- Configs version-controlled in GitHub

## Success Criteria

### Book Quality
- Entire book builds without errors in Docusaurus
- Smooth navigation, clean sidebar, and working links
- All examples tested and functioning

### Review Process
- Passes Spec-Kit Plus linting
- Passes AI fact-checking through Claude Code
- Zero broken links

### Deployment
- Live GitHub Pages site working
- Responsive and readable on mobile
- SEO meta tags correctly generated

## Governance
All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2025-12-05 | **Last Amended**: 2025-12-05
