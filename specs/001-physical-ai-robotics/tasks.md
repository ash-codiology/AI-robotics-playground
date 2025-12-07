---

description: "Task list for Physical AI & Humanoid Robotics Textbook implementation"
---

# Tasks: Physical AI & Humanoid Robotics Textbook

**Input**: Design documents from `/specs/001-physical-ai-robotics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Tests are OPTIONAL for this project, as not explicitly requested in the feature specification. However, specific test scripts are mentioned in plan.md for module validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths shown below assume the `/book` structure from plan.md.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project initialization and basic structure for the Docusaurus site and examples.

- [ ] T001 Create base Docusaurus project structure in `/book/`
- [ ] T002 [P] Create `book/docs/` directory
- [ ] T003 [P] Create `book/examples/` directory
- [ ] T004 [P] Create `book/capstone/` directory
- [ ] T005 [P] Create `book/assets/` directory
- [ ] T006 [P] Create `book/.github/workflows/` directory
- [ ] T007 Initialize Git LFS for assets in `book/assets/`
- [ ] T008 Create `book/VERSIONS.md`
- [ ] T009 Create `book/DEPLOY.md`
- [ ] T010 Create `book/.github/workflows/ci.yml`
- [ ] T011 Create `book/.github/workflows/deploy.yml`
- [ ] T012 Create `book/README.md`

---

## Phase 2: Foundational (Docusaurus Base Configuration)

**Purpose**: Core Docusaurus infrastructure that MUST be complete before ANY user story content can be added.

**⚠️ CRITICAL**: No user story content creation can begin until this phase is complete

- [ ] T013 Create `book/docusaurus.config.ts` with base configuration
- [ ] T014 Configure Docusaurus sidebar mapping for modules in `book/sidebars.ts`
- [ ] T015 Implement Docusaurus search (Algolia or local) in `book/docusaurus.config.ts`
- [ ] T016 Implement Docusaurus dark/light toggle in `book/docusaurus.config.ts`
- [ ] T017 Configure "Open in GitHub" edit link on Docusaurus pages (`book/docusaurus.config.ts`)
- [ ] T018 Set up static assets under `book/static/assets/` in Docusaurus config and project structure

**Checkpoint**: Docusaurus foundation ready - user story content creation can now begin.

---

## Phase 3: User Story 1 - Learning Physical AI Concepts (Priority: P1) 🎯 MVP

**Goal**: A student understands the foundational concepts of Physical AI, embodied intelligence, and the difference between digital and physical AI by reading the Introduction module.

**Independent Test**: Can be fully tested by reading the "Introduction" module and understanding the key concepts presented, then successfully answering conceptual questions.

### Implementation for User Story 1

- [ ] T019 [US1] Create `book/docs/introduction/index.md` for Introduction module
- [ ] T020 [US1] Add content for Purpose, Key Concepts, and Learning outcomes to `book/docs/introduction/index.md`
- [ ] T021 [US1] Add placeholder/embed for Human vs robot cognition diagram in `book/docs/introduction/index.md`
- [ ] T022 [US1] Add placeholder/embed for Course workflow diagram in `book/docs/introduction/index.md`
- [ ] T023 [US1] Ensure homepage link points to introduction (`book/src/pages/index.tsx`)

**Checkpoint**: At this point, the Introduction module should be complete and readable.

---

## Phase 4: User Story 2 - Building a Robotic Nervous System with ROS 2 (Priority: P1)

**Goal**: A reader learns how to use ROS 2 to structure robot control systems and connect AI agents to humanoid hardware. They follow Module 1 to understand ROS 2 architecture and build a basic system.

**Independent Test**: Can be fully tested by implementing a basic ROS 2 system for a humanoid robot, demonstrating understanding of nodes, topics, services, and actions.

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create `book/docs/module-1-ros2/index.md` for Module 1 (ROS2)
- [ ] T025 [P] [US2] Create `book/examples/01_ros2/README.md`
- [ ] T026 [P] [US2] Create `book/examples/01_ros2/package_ros2_baseline/` directory
- [ ] T027 [P] [US2] Create `book/examples/01_ros2/tests/test_ros_nodes.sh`
- [ ] T028 [US2] Add content for ROS 2 Concepts (DDS, nodes/topics/services/actions, QoS, parameters) to `book/docs/module-1-ros2/index.md`
- [ ] T029 [US2] Add content for ROS 2 Tooling (`rclpy`, `ros2 CLI`, launch system, `ros2bag`, `VERSIONS.md`) to `book/docs/module-1-ros2/index.md`
- [ ] T030 [US2] Add implementation walkthrough (teleop → controller → actuator chain; sample humanoid URDF) to `book/docs/module-1-ros2/index.md`
- [ ] T031 [US2] Add case study (head+arm control demo with sensor feedback) to `book/docs/module-1-ros2/index.md`
- [ ] T032 [US2] Add mini project (voice→action stub dry-run) to `book/docs/module-1-ros2/index.md`
- [ ] T033 [US2] Add debugging (QoS mismatch, missing transforms, permission errors) to `book/docs/module-1-ros2/index.md`

**Checkpoint**: At this point, User Story 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Creating Digital Twins with Gazebo & Unity (Priority: P2)

**Goal**: A reader aims to build and test humanoid behavior in controlled, virtual environments using Gazebo and Unity. They use Module 2 to set up simulations and understand physics and sensor simulation.

**Independent Test**: Can be fully tested by setting up a basic humanoid simulation in Gazebo or Unity, including basic physics and sensor data.

### Implementation for User Story 3

- [ ] T034 [P] [US3] Create `book/docs/module-2-simulation/index.md` for Module 2 (Simulation)
- [ ] T035 [P] [US3] Create `book/examples/02_simulation/README.md`
- [ ] T036 [P] [US3] Create `book/examples/02_simulation/gazebo_worlds/` directory
- [ ] T037 [P] [US3] Create `book/examples/02_simulation/tests/test_sim_stability.sh`
- [ ] T038 [US3] Add content for Concepts (URDF/SDF, dynamics, frames & TF) to `book/docs/module-2-simulation/index.md`
- [ ] T039 [US3] Add content for Tooling (`ros_gz` bridge, Unity robotics toolkit) to `book/docs/module-2-simulation/index.md`
- [ ] T040 [US3] Add implementation walkthrough (spawn URDF, attach camera/IMU, record rosbag) to `book/docs/module-2-simulation/index.md`
- [ ] T041 [US3] Add case study (pick-and-place in Gazebo) to `book/docs/module-2-simulation/index.md`
- [ ] T042 [US3] Add mini project (60s stability test, sensor output validation) to `book/docs/module-2-simulation/index.md`
- [ ] T043 [US3] Add debugging (bad inertias, joint limits, frame mismatches) to `book/docs/module-2-simulation/index.md`

**Checkpoint**: All user stories up to US3 should now be independently functional.

---

## Phase 6: User Story 4 - Implementing the AI-Robot Brain with NVIDIA Isaac (Priority: P2)

**Goal**: A reader wants to create intelligent robot decision systems using NVIDIA Isaac for perception, synthetic data, and navigation. They follow Module 3 for Isaac Sim, Isaac ROS, and Nav2.

**Independent Test**: Can be fully tested by setting up a basic perception and navigation system for a simulated humanoid using Isaac Sim and Isaac ROS.

### Implementation for User Story 4

- [ ] T044 [P] [US4] Create `book/docs/module-3-isaac/index.md` for Module 3 (Isaac)
- [ ] T045 [P] [US4] Create `book/examples/03_isaac/README.md`
- [ ] T046 [P] [US4] Create `book/examples/03_isaac/isaac_scenes/` directory
- [ ] T047 [P] [US4] Create `book/examples/03_isaac/tests/test_vslam_nav2.py`
- [ ] T048 [US4] Add content for Concepts (synthetic data, domain randomization, USD scenes, sim2real) to `book/docs/module-3-isaac/index.md`
- [ ] T049 [US4] Add content for Tooling (Isaac Sim, Isaac ROS adapters, Nav2 integration, GPU constraints) to `book/docs/module-3-isaac/index.md`
- [ ] T050 [US4] Add implementation walkthrough (synthetic data -> small model or plug-in pretrained model -> run VSLAM + Nav2) to `book/docs/module-3-isaac/index.md`
- [ ] T051 [US4] Add case study (Nav2 path from VSLAM-generated map) to `book/docs/module-3-isaac/index.md`
- [ ] T052 [US4] Add mini project (train/validate tiny detector on Isaac synthetic samples) to `book/docs/module-3-isaac/index.md`
- [ ] T053 [US4] Add debugging (GPU OOMs, mismatched package versions, missing USD stages) to `book/docs/module-3-isaac/index.md`

**Checkpoint**: All user stories up to US4 should now be independently functional.

---

## Phase 7: User Story 5 - Connecting Language, Perception, and Motion with VLA (Priority: P3)

**Goal**: A reader seeks to enable natural-language-controlled humanoid behavior by connecting language models, perception, and motion using Vision-Language-Action (VLA) systems. They implement an end-to-end example from Module 4.

**Independent Test**: Can be fully tested by building a simple voice-commanded task for a simulated humanoid, demonstrating the VLA pipeline.

### Implementation for User Story 5

- [ ] T054 [P] [US5] Create `book/docs/module-4-vla/index.md` for Module 4 (VLA)
- [ ] T055 [P] [US5] Create `book/examples/04_vla/README.md`
- [ ] T056 [P] [US5] Create `book/examples/04_vla/whisper_examples/` directory
- [ ] T057 [P] [US5] Create `book/examples/04_vla/tests/test_vla_pipeline.sh`
- [ ] T058 [US5] Add content for Concepts (ASR → LLM → symbolic plan → ROS action graph; safety & verification) to `book/docs/module-4-vla/index.md`
- [ ] T059 [US5] Add content for Tooling (Whisper audio pipeline, chosen LLM client, executor patterns in ROS2) to `book/docs/module-4-vla/index.md`
- [ ] T060 [US5] Add implementation walkthrough (WAV → transcript → templated prompt → deterministic plan → ROS action sequence) to `book/docs/module-4-vla/index.md`
- [ ] T061 [US5] Add case study (“place red cup on table” end-to-end in sim) to `book/docs/module-4-vla/index.md`
- [ ] T062 [US5] Add mini project (deterministic mapping from LLM response to ROS actions with retries/fallbacks) to `book/docs/module-4-vla/index.md`
- [ ] T063 [US5] Add debugging (ASR noise, LLM hallucination mitigation, action failure handling) to `book/docs/module-4-vla/index.md`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 8: Capstone Project: The Autonomous Humanoid

**Goal**: Build a simulated humanoid executing a voice-commanded task, integrating ROS 2, Gazebo/Unity, Isaac, and VLA.

**Independent Test**: `./run_capstone.sh --dry-run` boots the orchestration, prints success summary with no manual intervention.

### Implementation for Capstone Project

- [ ] T064 Create `book/capstone/run_capstone.sh`
- [ ] T065 Create `book/capstone/docker/` directory
- [ ] T066 Add Docker/compose configuration for the Capstone project in `book/capstone/docker/`
- [ ] T067 Add evaluation script placeholder in `book/capstone/`
- [ ] T068 Add reproducibility checklist placeholder in `book/capstone/`
- [ ] T069 Integrate representative examples from all modules into `book/capstone/run_capstone.sh`

**Checkpoint**: Capstone project dry-run should be executable.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality.

- [ ] T070 [P] Create `book/assets/screenshots/` directory
- [ ] T071 [P] Create `book/assets/small_rosbags/` directory
- [ ] T072 [P] Create `book/assets/usd_samples/` directory
- [ ] T073 Review and refine `book/VERSIONS.md` for all dependencies and versions
- [ ] T074 Update `book/DEPLOY.md` with detailed deployment instructions
- [ ] T075 Integrate inline citations to official docs (URL + tested version) across `book/docs/` pages and `book/VERSIONS.md`
- [ ] T076 Implement human validation checklist for each chapter
- [ ] T077 Document decisions needing documentation in an appendix
- [ ] T078 Document tradeoff examples in an appendix
- [ ] T079 Finalize Docusaurus configuration for search, theming, and deployment
- [ ] T080 Ensure all examples include reproducibility matrix details in their `README.md`
- [ ] T081 Set up CI/CD pipeline for Docusaurus build and deployment to GitHub Pages
- [ ] T082 Rename `book/docs/intro.md` to `book/docs/introduction/index.md` and move appendices into `book/docs/appendix/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Capstone (Phase 8)**: Depends on all user stories (Phase 3-7) being complete.
- **Polish (Phase 9)**: Depends on all desired user stories and Capstone being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Content creation before placeholder replacement.
- Example structure creation before detailed example implementation.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel (within Phase 2).
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows).
- Tasks within a story marked [P] can run in parallel (e.g., creating docs and example READMEs).
- Different user stories can be worked on in parallel by different team members.
- Polish tasks marked [P] can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (e.g., ensure Introduction module is readable and comprehensible)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add Capstone Project → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 & 2 (P1 stories)
   - Developer B: User Story 3 & 4 (P2 stories)
   - Developer C: User Story 5 (P3 story)
   - Developer D: Capstone and Polish (once dependent stories are complete)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify content correctness at each checkpoint.
- Commit after each task or logical group.
- Stop at any checkpoint to validate story independently.
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence.