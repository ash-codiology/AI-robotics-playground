# VERSIONS.md

This file documents all tested versions of software and key dependencies used in the Physical AI & Humanoid Robotics textbook. Maintaining consistent versions is crucial for reproducibility and avoiding compatibility issues.

## Core Technologies and Frameworks

-   **Docusaurus**: ^2.0.0 (Specific version to be confirmed during initial setup)
-   **Node.js**: ^16.0.0 (LTS version compatible with Docusaurus)
-   **ROS 2 Distribution**: Humble Hawksbill (See [ROS 2 Humble Documentation](https://docs.ros.org/en/humble/index.html), accessed 2025-11-20)
-   **Python**: ^3.8 (Compatible with ROS 2 Humble)
-   **Git LFS**: ^3.0.0

## Robotics and AI Libraries/Tools

-   **Automatic Speech Recognition (ASR)**: Whisper (OpenAI's model, specific version/library to be confirmed)
-   **Large Language Model (LLM) Client**: (e.g., OpenAI Python client, Hugging Face Transformers - specific choice and version to be confirmed)
-   **ROS 2 Packages**:
    -   `rclpy` (Python client library for ROS 2)
    -   `std_msgs` (Standard ROS 2 message types)
    -   `ament_index_python` (for finding ROS 2 packages)
    -   `launch` & `launch_ros` (for ROS 2 launch files)
-   **Simulation**:
    -   **Gazebo**: Fortress (if used for specific examples, primarily relying on Isaac Sim)
    -   **Unity Robotics Toolkit**: (Specific version if Unity examples are fully integrated)
-   **NVIDIA Isaac Platform**:
    -   **Isaac Sim**: ^2023.1 (Specific version to be confirmed)
    -   **Isaac ROS**: (Specific packages like `isaac_ros_visual_slam`, `isaac_ros_common` - versions tied to Isaac Sim)
    -   **Nav2**: (Integrated with ROS 2 Humble, specific version to be confirmed)

## Development and Build Tools

-   **Docker**: ^20.10.0
-   **Docker Compose**: ^2.0.0
-   **`apt-get` packages**: `python3-pip`, `git` (as used in Dockerfile)

---

**Note**: Specific patch versions for all dependencies will be rigorously tested and updated here as the project matures to ensure complete reproducibility of all examples and the capstone project.
