# Data Model: Physical AI & Humanoid Robotics Textbook

**Purpose**: Defines the key entities and their relationships within the context of the Physical AI & Humanoid Robotics Textbook.
**Created**: 2025-12-06
**Feature**: [D:/Q4_Hackathon/specs/001-physical-ai-robotics/spec.md]

## Entities

### 1. Textbook
- **Description**: The primary educational product, a comprehensive guide to Physical AI and humanoid robotics.
- **Attributes**:
    - `title`: "From Digital Minds to Physical Robots: A Practical Guide to Physical AI & Humanoid Robotics"
    - `targetAudience`: Undergraduate/graduate students, early-career engineers, technical learners.
    - `modules`: List of `Module` entities.

### 2. Module
- **Description**: A self-contained section of the textbook, focusing on specific learning objectives and technologies.
- **Attributes**:
    - `name`: (e.g., "The Robotic Nervous System (ROS 2)", "The Digital Twin (Gazebo & Unity)")
    - `learningOutcomes`: Specific knowledge/skills acquired after completing the module.
    - `chapterGoals`: Detailed objectives for each chapter within the module.
    - `content`: Textual and visual material (figures, diagrams, examples).
    - `technologiesCovered`: (e.g., ROS 2, Gazebo, Unity, NVIDIA Isaac, VLA).

### 3. Reader/Student
- **Description**: The target audience engaging with the textbook.
- **Attributes**:
    - `background`: Basic programming in Python, interest in robotics/AI.
    - `learningProgress`: Tracking of completed modules/chapters (conceptual).

### 4. Humanoid Robot
- **Description**: The physical or simulated entity being controlled and studied.
- **Attributes**:
    - `type`: Physical or Simulated.
    - `components`: (e.g., actuators, sensors, joints, links).
    - `controlSystem`: Implementation using `Robotics Middleware`.

### 5. AI Agent
- **Description**: Software components responsible for intelligent decision-making and control within the robot.
- **Attributes**:
    - `functionality`: (e.g., perception, navigation, task planning, natural language processing).
    - `integration`: Connects with `Robotics Middleware` and `VLA System`.

### 6. Simulation Environment
- **Description**: Virtual worlds for safe, physics-based testing and development of humanoid behavior.
- **Attributes**:
    - `platform`: (e.g., Gazebo, Unity, Isaac Sim).
    - `physicsEngine`: Handles gravity, collisions, dynamics.
    - `sensors`: Simulated cameras, IMUs, LiDAR.
    - `robotModels`: `Humanoid Robot` models (URDF, SDF, USD).

### 7. Robotics Middleware
- **Description**: Software platform (like ROS 2) facilitating communication and coordination between various robot components and AI agents.
- **Attributes**:
    - `protocol`: (e.g., DDS for ROS 2).
    - `communicationPatterns`: Nodes, topics, services, actions.
    - `clientLibraries`: (e.g., `rclpy`).

### 8. VLA System (Vision-Language-Action System)
- **Description**: Components connecting language models, perception, and motion for natural-language-controlled humanoid behavior.
- **Attributes**:
    - `voiceRecognition`: (e.g., Whisper).
    - `languageModel`: (e.g., LLM for symbolic planning).
    - `actionGraph`: Maps symbolic plans to `Robotics Middleware` actions.

## Relationships

- A `Textbook` contains multiple `Module`s.
- A `Reader/Student` consumes `Module`s within a `Textbook`.
- A `Humanoid Robot` is controlled by `AI Agent`s via `Robotics Middleware`.
- `AI Agent`s leverage `VLA System`s for intelligent behavior.
- `Simulation Environment`s host `Humanoid Robot` models for testing.
- `Robotics Middleware` integrates `AI Agent`s and `Humanoid Robot` components.
- `VLA System`s utilize `Robotics Middleware` to execute actions.
