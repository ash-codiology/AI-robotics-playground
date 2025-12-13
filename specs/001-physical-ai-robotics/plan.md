# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary
This plan outlines the creation of a comprehensive textbook, "From Digital Minds to Physical Robots: A Practical Guide to Physical AI & Humanoid Robotics". It will feature a 4-module backbone, teaching students to build a reproducible humanoid robotics pipeline from code to simulation, perception, and task execution. The book will be delivered as a Docusaurus markdown site deployed via GitHub Pages, incorporating runnable examples and a CI/CD pipeline.

## Technical Context

**Language/Version**: Python 3.x (latest stable), JavaScript (for Docusaurus)
**Primary Dependencies**: ROS2, Gazebo/Unity, NVIDIA Isaac Sim, Isaac ROS, Nav2, Whisper (ASR), various LLM clients (local or API), Docusaurus v3, Node.js, npm
**Storage**: N/A (book content in markdown files, small assets in Git LFS if needed)
**Testing**: `pytest`, `test_ros_nodes.sh`, `test_sim_stability.sh`, `test_vslam_nav2.py`, `test_vla_pipeline.sh`, Docusaurus build tests, GitHub Actions CI
**Target Platform**: Ubuntu 22.04 LTS (primary development), Windows/macOS (for Docusaurus/Unity), Jetson Edge Kit (optional physical deployment)
**Project Type**: Textbook with runnable code examples, Docusaurus site
**Performance Goals**: Docusaurus site loads quickly, runnable examples execute efficiently, CI/CD pipeline deploys reliably, simulated robot performance (e.g., 60 FPS in Gazebo/Isaac).
**Constraints**: Book content ~12,000–20,000 words total. Reproducible examples. Modular structure. GitHub Pages deployment.
**Scale/Scope**: 4 core modules + Capstone project, comprehensive guide for target audience (Undergraduate/graduate students, early-career engineers, technical learners).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   **Book Length**: The planned comprehensive textbook is consistent with the 12,000–20,000 words total constraint. (✓ PASS)
-   **Tools Required**: The project's use of ROS 2, Gazebo/Unity, Isaac, VLA, Docusaurus, and GitHub Pages aligns with the required tools (Spec-Kit Plus, Claude Code, Docusaurus, GitHub Pages). (✓ PASS)
-   **Project Structure**: The defined project structure in the plan, including chapter-specific folders and configuration version control, adheres to Spec-Kit Plus templates. (✓ PASS)
-   **Book Quality**: The plan's emphasis on clarity, modularity, visual richness, and conceptual accuracy is consistent with the success criteria for error-free builds, smooth navigation, working links, and tested examples. (✓ PASS)
-   **Review Process**: The plan's focus on quality validation and reproducibility supports the constitution's requirements for linting, AI fact-checking, and zero broken links. (✓ PASS)
-   **Deployment**: The CI/CD pipeline to GitHub Pages aligns with the requirement for a live, responsive, and SEO-optimized GitHub Pages site. (✓ PASS)

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-robotics/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (already exists and filled from previous execution)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
book/
├── .docusaurus/      # Docusaurus build artifacts
├── .github/
│   └── workflows/    # GitHub Actions workflows (CI/CD)
├── assets/           # Images, rosbags, USD samples
├── blog/             # Docusaurus blog (disabled)
├── capstone/         # Capstone project scripts and config
├── docs/             # Markdown files for the book content
│   ├── appendix/     # Appendices (decisions, tradeoffs)
│   ├── capstone/     # Capstone project documentation
│   ├── introduction/ # Introduction module
│   ├── module-1-ros2/ # ROS 2 module
│   ├── module-2-simulation/ # Simulation module
│   ├── module-3-isaac/ # NVIDIA Isaac module
│   └── module-4-vla/ # VLA module
├── examples/         # Runnable code examples for each module
│   ├── 01_ros2/
│   ├── 02_simulation/
│   ├── 03_isaac/
│   └── 04_vla/
├── node_modules/     # Node.js dependencies
├── src/              # Docusaurus custom components and pages
├── static/           # Static assets (images, favicon)
├── docusaurus.config.ts
├── package.json
├── package-lock.json
├── sidebars.ts
├── tsconfig.json
└── VERSIONS.md
```

**Structure Decision**: The project adheres to a Docusaurus-centric structure, with book content in `book/docs/` and runnable examples in `book/examples/`. This mirrors a common documentation-as-code approach, ensuring content modularity and direct integration with CI/CD for publishing. The repository root serves as the overall project container, with `book/` holding the Docusaurus site. Files like `data-model.md` and `research.md` are generated within `specs/001-physical-ai-robotics/`. Contracts and quickstart are not generated in this execution but would be placed in `specs/001-physical-ai-robotics/contracts/` and `specs/001-physical-ai-robotics/quickstart.md` respectively, if required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## High-level architecture of the book (4-module backbone)

**Pipeline**: Digital Brain ➜ Simulation ➜ Perception ➜ Autonomy
**Technical path**: ROS2 (Control) ➜ Gazebo/Unity (Physics) ➜ NVIDIA Isaac (Perception + Navigation) ➜ VLA (Task)
**Book output format**: Docusaurus markdown ➜ GitHub Pages deployment

## Chapter structure under each module

Each module will be broken into:
1.  Concepts
2.  Tooling
3.  Implementation walkthrough
4.  Case study / example
5.  Mini project
6.  Debugging & common failures

## Core technical anchors

-   **ROS2**: rclpy, Nodes, URDF, Actions
-   **Gazebo/Unity**: URDF load, physics engine, sensor simulation
-   **NVIDIA Isaac**: Omniverse USD, Isaac Sim, Isaac ROS, VSLAM, Nav2
-   **VLA**: Whisper ➜ LLM task decomposition ➜ ROS action graph

## Research approach

**Research-concurrent writing**:
-   Consult official docs at module boundaries
-   Use simulation logs, SDK specs, hardware constraints
-   Minimize theory ➜ maximize executable examples
**Hardware-informed pedagogy**:
-   GPU requirements (RTX, VRAM)
-   Edge inference (Jetson Orin)
-   Humanoid/Proxy robot capabilities

## Quality validation

-   Verify every code example executes on: Ubuntu 22.04 ➜ ROS2 Humble/Iron
-   Simulation reproducibility:
    -   Gazebo worlds load + sensors give data
    -   Isaac pipelines tested with sample scenes
    -   VLA outputs deterministic enough to plan tasks

## Decisions needing documentation

-   Simulation vs real robots tradeoffs
-   RTX workstation vs Cloud Isaac Sim
-   Humanoid body model complexity (URDF/SDF)
-   Jetson deployment constraints
-   Voice-based autonomy vs button commands
-   Nav2 limitations for biped locomotion

## Tradeoff examples

-   Gazebo (fast setup) vs Isaac (GPU heavy + photorealistic)
-   Jetson Orin Nano (cheap) vs Orin NX (stable + memory overhead)
-   Quadruped proxy vs Humanoid build
-   Local control loops vs cloud inference
-   End-to-end VLA vs modular ROS pipelines

## Testing strategy

-   **Module 1**: Validate ROS nodes send commands and receive sensor messages
-   **Module 2**: Validate physics simulation ➜ object + robot stable for 60s
-   **Module 3**: Validate VSLAM map + Nav2 path to target waypoint
-   **Module 4**: Validate speech ➜ plan + action execution

## Validation checks

-   Does the book enable a student to build a humanoid pipeline without guessing?
-   Do instructions match actual commands and SDK versions?
-   Are hardware requirements realistic and precise?
-   Is every code example runnable from scratch?

## Technical details

Use research-concurrent approach (learn Isaac pipelines + write implementation side-by-side)
Reference official robotics documentation (ROS2, Gazebo, Isaac, Whisper, Nav2)
Use inline citations to original SDK docs
Follow Constitution standards for accuracy and reproducibility

## Organization by phases

1.  **Research**: Survey official docs, SDK APIs, hardware constraints
2.  **Foundation**: Teach concepts and prerequisites for each module
3.  **Analysis**: Implement examples and architecture choices
4.  **Synthesis**: Integrate simulation, navigation, and VLA autonomy into capstone

