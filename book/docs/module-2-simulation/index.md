---
id: index
title: The Digital Twin (Gazebo & Unity)
sidebar_position: 3
---

# Module 2: The Digital Twin (Gazebo & Unity)

## Purpose

This module focuses on building and testing humanoid robot behavior in controlled, virtual environments. You will learn how to use simulation platforms like Gazebo (and optionally Unity) to create digital twins, understanding physics simulation, sensor modeling, and how to interact with these environments. This is crucial for safe, efficient, and reproducible robotics development.

## Key Concepts

1.  **Unified Robot Description Format (URDF)**: An XML format for describing robot kinematics (joints, links) and inertials (mass, inertia tensor).
2.  **Simulation Description Format (SDF)**: An XML format for describing robots, environments, and other objects in a simulator like Gazebo.
3.  **Dynamics Basics**: Understanding concepts like mass, inertia, friction, and how they affect robot behavior in simulation.
4.  **Frames and Transformations (TF)**: Managing coordinate frames and transforming data between them, crucial for multi-component robotic systems.
5.  **Digital Twin**: A virtual model of a physical object or system, used for analysis, monitoring, and simulation.

## Learning Outcomes

Upon completing this module, you will be able to:

-   Describe the purpose and structure of URDF and SDF files.
-   Set up a basic humanoid robot model in a Gazebo simulation environment.
-   Integrate common sensors (camera, IMU) into a simulated robot.
-   Record and analyze sensor data using `ros2bag` in a simulated environment.
-   Understand basic physics parameters and their impact on simulation realism.

## Tooling

This module primarily uses the following tools and libraries:

-   **Gazebo**: A powerful 3D robot simulator. We will use the `ros_gz` (ROS 2 Gazebo) bridge for seamless integration.
-   **`ros_gz` Bridge**: A package for bidirectional communication between ROS 2 and Gazebo.
-   **Unity Robotics Toolkit (Optional)**: A set of tools, tutorials, and examples for robotic simulation in Unity.

## Implementation Walkthrough: Spawn URDF, Attach Camera/IMU, Record Rosbag

This walkthrough will guide you through setting up a basic Gazebo simulation with a humanoid robot, attaching virtual sensors, and recording the generated sensor data.

### Step 1: Install Gazebo and `ros_gz` Bridge

Follow the official ROS 2 documentation to install Gazebo Garden and the `ros_gz` bridge packages compatible with your ROS 2 Humble installation.

```bash
sudo apt install ros-humble-gazebo-ros-pkgs ros-humble-ros-gz
```

### Step 2: Create a Simple Humanoid URDF

We'll use a simplified humanoid URDF for this example. Create a new ROS 2 package for your robot description.

```bash
mkdir -p ~/ros2_ws/src/humanoid_description
cd ~/ros2_ws/src/humanoid_description
ros2 pkg create humanoid_description --build-type ament_python

# Create a `urdf` directory inside `humanoid_description`
mkdir -p urdf

# Create a simple_humanoid.urdf file in the `urdf` directory
# book/examples/02_simulation/humanoid_description/urdf/simple_humanoid.urdf
```

**`simple_humanoid.urdf` content (minimal example - more complex URDFs would be used for full humanoids)**:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.1 0.1 0.2"/>
      </geometry>
    </visual>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>
</robot>
```

### Step 3: Create a Gazebo Launch File to Spawn the Robot

Create a launch file to spawn your URDF model in an empty Gazebo world. This will be in `book/examples/02_simulation/launch/spawn_humanoid.launch.py`.

```python
# book/examples/02_simulation/launch/spawn_humanoid.launch.py

import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node

def generate_launch_description():
    # Get the path to the robot_description package
    humanoid_description_path = get_package_share_directory('humanoid_description')
    urdf_file = os.path.join(humanoid_description_path, 'urdf', 'simple_humanoid.urdf')

    # Convert URDF to SDF (Gazebo uses SDF)
    # Note: For simple URDFs, Gazebo often handles them directly. For complex cases, convert.
    # Using robot_state_publisher to publish TF
    robot_state_publisher_node = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='screen',
        parameters=[{'robot_description': open(urdf_file).read()}])

    # Spawn the robot in Gazebo
    gazebo_spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=['-entity', 'simple_humanoid', '-file', urdf_file],
        output='screen')

    # Launch Gazebo itself
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(os.path.join(
            get_package_share_directory('gazebo_ros'), 'launch', 'gazebo.launch.py'))
    )

    return LaunchDescription([
        gazebo_launch,
        robot_state_publisher_node,
        gazebo_spawn_entity,
    ])
```

### Step 4: Attach a Simulated Camera and IMU (Conceptual)

For brevity, we won't add the full sensor URDF/SDF here, but conceptually, you would extend your `simple_humanoid.urdf` to include camera and IMU links and joints, and then use `ros_gz_bridge` to publish their data as ROS 2 topics.

**Example `simple_humanoid.urdf` extension (conceptual)**:

```xml
<link name="camera_link">
  <!-- visual, inertial, collision properties -->
</link>
<joint name="camera_joint" type="fixed">
  <parent link="base_link"/>
  <child link="camera_link"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
</joint>
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <always_on>true</always_on>
    <update_rate>30.0</update_rate>
    <camera>
      <horizontal_fov>1.047</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>camera</namespace>
        <argument>--ros-args -r __ns:=/camera</argument>
      </ros>
      <cameraName>simple_humanoid_camera</cameraName>
      <imageTopicName>image_raw</imageTopicName>
      <cameraInfoTopicName>camer-info</cameraInfoTopicName>
    </plugin>
  </sensor>
</gazebo>
```

### Step 5: Record Sensor Data with `ros2bag`

Once your robot is spawned and sensors are publishing, you can record the data:

1.  **Launch your Gazebo simulation**:
    ```bash
    ros2 launch humanoid_description spawn_humanoid.launch.py
    ```
2.  **Identify sensor topics** (e.g., `/camera/image_raw`, `/imu/data`). You can use `ros2 topic list`.
3.  **Start recording** (in a new terminal, after sourcing your workspace):
    ```bash
    ros2 bag record -a # Records all topics, or specify topics: ros2 bag record /camera/image_raw /imu/data
    ```

This will create a `.bag` file containing the recorded sensor data, which can be replayed later for analysis or algorithm development.
