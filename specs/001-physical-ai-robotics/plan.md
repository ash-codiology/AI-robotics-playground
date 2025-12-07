Physical AI & Humanoid Robotics (Complete Plan with Docusaurus + GitHub Pages Deliverable)

One-line mission:
Teach students to build a reproducible humanoid robotics pipeline from code → simulation → perception → task execution using ROS2, Gazebo/Unity, NVIDIA Isaac, and a Vision-Language-Action (VLA) stack. Deliver a Docusaurus textbook + runnable examples and a CI/CD pipeline that deploys to GitHub Pages.

1 — Architecture sketch (4-module backbone)

Pipeline (visual):
Digital Brain ➜ Simulation ➜ Perception ➜ Autonomy

Technical path:
ROS2 (Control) ➜ Gazebo/Unity (Physics) ➜ NVIDIA Isaac (Perception + Navigation) ➜ VLA (Task: Whisper → LLM → ROS action graph)

Book output format (deliverable):
Docusaurus markdown → GitHub Pages (automated via GitHub Actions)

2 — Section & chapter structure (each module follows this pattern)

Each module is organized into 6 consistent sections to keep the book modular and reproducible:

Concepts — core theory (concise) and learning outcomes

Tooling — SDKs, versions, CLI commands, config files

Implementation walkthrough — step-by-step runnable example(s)

Case study / example — a short real-world scenario

Mini project — hackathon-friendly assignment with acceptance tests

Debugging & common failures — reproducible troubleshooting checklist

3 — 4 Modules (high level + chapter bullets)
Module 1 — The Robotic Nervous System (ROS2)

Concepts: DDS, nodes/topics/services/actions, QoS, parameters

Tooling: rclpy, ros2 CLI, launch system, ros2bag, VERSIONS.md

Implementation walkthrough: teleop → controller → actuator chain; sample humanoid URDF

Case study: head+arm control demo with sensor feedback

Mini project: voice→action stub (dry-run) mapping to action graph

Debugging: QoS mismatch, missing transforms, permission errors

Module 2 — The Digital Twin (Gazebo & Unity)

Concepts: URDF/SDF, dynamics basics (mass, inertia), frames & TF

Tooling: ros_gz (ros2_gazebo) bridge, Unity robotics toolkit (optional)

Implementation walkthrough: spawn URDF, attach camera/IMU, record rosbag

Case study: pick-and-place in Gazebo (sensor→perception stub→actuator)

Mini project: 60s stability test, sensor output validation

Debugging: bad inertias, joint limits, frame mismatches

Module 3 — The AI-Robot Brain (NVIDIA Isaac / Omniverse)

Concepts: synthetic data, domain randomization, USD scenes, sim2real

Tooling: Isaac Sim, Isaac ROS adapters, Nav2 integration, GPU constraints

Implementation walkthrough: synthetic data -> small model or plug-in pretrained model -> run VSLAM + Nav2

Case study: Nav2 path from VSLAM-generated map

Mini project: train/validate tiny detector on Isaac synthetic samples and run in Isaac ROS node

Debugging: GPU OOMs, mismatched package versions, missing USD stages

Module 4 — Vision-Language-Action (VLA)

Concepts: ASR → LLM → symbolic plan → ROS action graph; safety & verification

Tooling: Whisper audio pipeline, chosen LLM client (local or API), executor patterns in ROS2

Implementation walkthrough: WAV → transcript → templated prompt → deterministic plan → ROS action sequence

Case study: “place red cup on table” end-to-end in sim

Mini project: deterministic mapping from LLM response to ROS actions with retries/fallbacks

Debugging: ASR noise, LLM hallucination mitigation (prompt engineering + checks), action failure handling

Capstone — Autonomous Humanoid Integration

Combine representative examples of all modules into one pipeline

Deliverables: run_capstone.sh (dry-run), Docker/compose, evaluation script, reproducibility checklist

4 — Core technical anchors (explicit)

ROS2: rclpy, nodes, topics, services, actions, URDF, launch files, TF2

Gazebo/Unity: URDF load, SDF, physics parameters, sensors (camera, LiDAR, IMU), rosbag export

NVIDIA Isaac: Omniverse USD, Isaac Sim scenes, Isaac ROS, VSLAM, Nav2 integration (hardware acceleration)

VLA: Whisper (ASR) → LLM prompt templates → deterministic policy → ROS action graph + safety wrappers

5 — Research-concurrent writing approach (anti-hallucination)

Principle: write with SDKs, not about them. Every conceptual claim must map to an executable sample.

Per-module boundary checks: before finalizing a module, consult official docs for every referenced command/API and pin the URL + version inline.

Versions & artifacts: include VERSIONS.md (OS, ROS2 distro, Gazebo, Isaac Sim version, Python packages, Whisper/LLM client).

Repro steps while writing: clone official example → adapt minimally → run → capture logs/screenshots → embed into chapter.

Use official samples as base and annotate extensions rather than inventing new APIs.

6 — Hardware-informed pedagogy

Minimum reproducible baseline: Ubuntu 22.04 LTS, 4-core CPU, 16 GB RAM, GPU optional for Gazebo/Isaac steps (RTX 3060/12GB min)

Recommended workstation: 32 GB RAM, RTX 3080+ (10–12 GB+), NVMe SSD

Edge profile (Jetson): Orin NX 8–16GB recommended for non-heavy models; Orin AGX recommended for larger workloads

Provide three hardware profiles in the book: Student Laptop / Dev Workstation / Cloud + Jetson deploy guide with quantization and swap tricks.

7 — Quality validation & reproducibility (concrete)
A — Reproducibility matrix (per example)

Every example must include:

OS + distro (exact)

SDK versions (ROS2 distro + package versions)

Docker image (if used) or install script

Test script name and how to run it

Expected output example (sample logs/snapshots)
All of this stored in examples/<example>/README.md and aggregated in VERSIONS.md.

B — Module validation tests (runnable)

Module 1 (ROS2): test_ros_nodes.sh — launch publisher & subscriber, assert N messages in T seconds.

Module 2 (Simulation): test_sim_stability.sh — spawn robot in Gazebo via launch file, run 60s headless simulation; assert no physics exceptions; assert sensor topics publish.

Module 3 (Isaac): test_vslam_nav2.py — start Isaac Sim scene headless (or minimal), verify VSLAM produces map file, Nav2 produces a planned path. (GPU test; optional skip in non-GPU CI).

Module 4 (VLA): test_vla_pipeline.sh — feed canned WAV → expected Whisper transcript string; feed to deterministic planner → assert expected ROS action calls (dry-run).

C — CI / GitHub Actions

Linting & unit tests run on push (matrix: python versions, Ubuntu 22.04)

Light smoke tests run on free runners (Module 1 & 2 headless CPU jobs)

GPU/Isaac heavy tests run on self-hosted GPU runners or explicit manual dispatch with workflow_dispatch (document how to run).

Deploy action builds Docusaurus and pushes to gh-pages branch.

D — Artifact & data management

Small sample datasets, USD scenes, and short rosbags included in assets/ (use Git LFS or DVC for larger assets).

Each sample includes a minimal data subset so users can run examples without downloading hundreds of MB.

E — Human validation

Each chapter has a “chapter QA checklist” for human testing: fresh VM installation, follow steps, capture deviations, update text.

8 — Decisions needing documentation (appendix)

Document the rationale + recommended path for:

Simulation vs real robots (cost, safety, determinism)

RTX workstation vs Cloud Isaac Sim (costs & performance)

URDF vs SDF vs USD: fidelity vs complexity

Humanoid model fidelity (minimal vs full)

Jetson deployment constraints and model quantization strategies

Voice autonomy safety (guardrails, permission model, emergency stop)

Nav2 limitations for biped locomotion (use Nav2 for proxy/wheeled/holonomic; discuss humanoid-specific locomotion controllers)

9 — Tradeoff examples (concise)

Gazebo: easy, CPU friendly, lots of ROS2 examples → best for bootstrapping.

Isaac: photorealistic, GPU heavy, best for synthetic datasets & sim2real.

Jetson Orin Nano vs NX: Nano cheaper, less VRAM; NX better for production.

Quadruped proxy: simpler to demo than full humanoid.

Local inference vs Cloud: latency vs compute tradeoffs; include failover patterns.

10 — Testing & pass criteria

Per-module tests must pass (see 7.B).

Capstone pass criteria: ./run_capstone.sh --dry-run boots the orchestration, prints success summary with no manual intervention.

Book validation: pick 2 fresh VMs (student and workstation profile), follow DEPLOY.md and complete CAPSTONE dry-run; log any deviations.

11 — Repo & doc organization (deliverable structure)
/book
  docs/                  # Docusaurus docs (mirrors book)
  examples/
    01_ros2/
      README.md
      package_ros2_baseline/
      tests/test_ros_nodes.sh
    02_simulation/
      README.md
      gazebo_worlds/
      tests/test_sim_stability.sh
    03_isaac/
      README.md
      isaac_scenes/
      tests/test_vslam_nav2.py
    04_vla/
      README.md
      whisper_examples/
      tests/test_vla_pipeline.sh
  capstone/
    run_capstone.sh
    docker/
  assets/
    screenshots/
    small_rosbags/
    usd_samples/
  VERSIONS.md
  DEPLOY.md
  PLAN.md              # this file
  .github/
    workflows/
      ci.yml
      deploy.yml
  README.md

12 — Docusaurus + GitHub Pages deliverable (added / required)

Docusaurus site (v3) must be generated from docs/ and include:

Sidebar mapping to modules & chapters

Code blocks with “copy” button

Search (Algolia or local) and dark/light toggle

“Open in GitHub” edit link on each page

Static assets under /static/assets/

GitHub Pages deployment (CI):

.github/workflows/deploy.yml:

on: push to main and manual dispatch

Steps: node setup → npm ci → npm run build → deploy to gh-pages using peaceiris/actions-gh-pages or gh-pages tool

Build badges in README and deployment status

Versioning: tag v0.1.0, v0.5.0, v1.0.0 with definitions for each milestone.

13 — Inline citations & accuracy standards

All SDK-level commands, API calls, and config options must include an inline citation to the official docs (URL + tested version) in docs/ pages and VERSIONS.md.

Keep VERSIONS.md updated with tested combinations (Ubuntu + ROS2 distro + Isaac Sim version + Python packages).

14 — Delivery & next actions (what I can do now)

Pick one and I will generate it immediately:

1. **Module 1 detailed spec** — chapters, learning outcomes, ~2k words, runnable code templates, tests (ready-to-add to `docs/module-1-ros2/`).
2. **Full Docusaurus repo scaffold** — create file tree, `package.json`, `docusaurus.config.js` template, `deploy.yml`, starter docs Markdown pages, and a ready `README.md`.
3. **Capstone `run_capstone.sh` dry-run script** + minimal orchestration example that works on CPU-only with simulated placeholders. 