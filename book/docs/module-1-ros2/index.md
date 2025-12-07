---
id: module-1-ros2
title: The Robotic Nervous System (ROS 2)
sidebar_position: 2
---

# Module 1: The Robotic Nervous System (ROS 2)

## Purpose

This module introduces you to the Robotic Operating System 2 (ROS 2), a flexible framework for writing robot software. You will learn how ROS 2 facilitates communication between different components of a robot, from low-level sensor drivers to high-level AI decision-making. By the end of this module, you will be able to structure basic robot control systems and understand how to connect AI agents to humanoid hardware.

## Key Concepts

1.  **Data Distribution Service (DDS)**: The underlying communication middleware for ROS 2, providing real-time, peer-to-peer data exchange.
2.  **ROS 2 Nodes**: Executable processes that perform computation (e.g., sensor data processing, motor control).
3.  **Topics**: A publish/subscribe mechanism for asynchronous data streaming (e.g., camera images, joint states).
4.  **Services**: A request/response mechanism for synchronous communication (e.g., querying a sensor, setting a motor position).
5.  **Actions**: A long-running goal-oriented communication pattern with feedback and cancellability (e.g., navigating to a goal, performing a complex manipulation).
6.  **Quality of Service (QoS)**: Parameters that define the reliability, durability, and latency of ROS 2 communications.
7.  **Parameters**: Dynamic configuration values that can be changed at runtime for nodes.

## Learning Outcomes

Upon completing this module, you will be able to:

-   Explain the core architecture of ROS 2 and the role of DDS.
-   Implement ROS 2 nodes, topics, services, and actions using `rclpy`.
-   Configure QoS settings for different communication needs.
-   Utilize ROS 2 command-line interface (CLI) tools for introspection and debugging.
-   Understand the basics of URDF (Unified Robot Description Format) for robot modeling.
-   Implement a basic teleoperation system and a simple controller chain.

## Tooling

This module primarily uses the following tools and libraries:

-   **ROS 2 CLI**: Command-line utilities for interacting with ROS 2 (e.g., `ros2 run`, `ros2 topic`, `ros2 node`).
-   **`rclpy`**: The Python client library for ROS 2, used for writing nodes.
-   **Launch System**: XML or Python-based files (`.launch.py`) for orchestrating multiple ROS 2 nodes.
-   **`ros2bag`**: A tool for recording and replaying ROS 2 message data.
-   **`VERSIONS.md`**: As discussed in the plan, this file tracks the specific versions of all dependencies.

## Implementation Walkthrough: Teleop → Controller → Actuator Chain

This walkthrough will guide you through building a minimal ROS 2 system for controlling a simulated humanoid robot. We will create a chain of nodes:

1.  **Teleoperation Node**: Publishes desired commands (e.g., joint angles) based on user input (e.g., keyboard).
2.  **Controller Node**: Subscribes to teleop commands, performs basic inverse kinematics (simplified), and publishes actuator commands.
3.  **Actuator Node (Simulator Interface)**: Subscribes to actuator commands and updates a simplified humanoid URDF model in a virtual environment (e.g., displaying joint states).

### Step 1: Set up your ROS 2 Workspace

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
git clone <YOUR_HUMANOID_URDF_REPO> # Placeholder for a simple humanoid URDF
# e.g., git clone https://github.com/robotics/simple_humanoid_urdf.git
cd ~/ros2_ws
rosdep install -i --from-path src --rosdistro humble -y
colcon build
source install/setup.bash
```

### Step 2: Create Teleoperation Node (`teleop_node.py`)

```python
# book/examples/01_ros2/package_ros2_baseline/teleop_node.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray

class TeleopNode(Node):
    def __init__(self):
        super().__init__('teleop_node')
        self.publisher_ = self.create_publisher(Float32MultiArray, 'joint_commands', 10)
        self.timer = self.create_timer(0.1, self.timer_callback) # Publish every 100ms
        self.get_logger().info('Teleop node started. Use keyboard to send commands.')

    def timer_callback(self):
        msg = Float32MultiArray()
        # Placeholder: In a real scenario, read keyboard input here
        msg.data = [0.1, -0.2, 0.3] # Example joint commands
        self.publisher_.publish(msg)
        # self.get_logger().info(f'Publishing: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = TeleopNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: Create Controller Node (`controller_node.py`)

```python
# book/examples/01_ros2/package_ros2_baseline/controller_node.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray

class ControllerNode(Node):
    def __init__(self):
        super().__init__('controller_node')
        self.subscription = self.create_subscription(
            Float32MultiArray,
            'joint_commands',
            self.listener_callback,
            10)
        self.subscription # prevent unused variable warning
        self.publisher_ = self.create_publisher(Float32MultiArray, 'actuator_commands', 10)
        self.get_logger().info('Controller node started.')

    def listener_callback(self, msg):
        # self.get_logger().info(f'Received joint commands: {msg.data}')
        actuator_msg = Float32MultiArray()
        # Placeholder: Perform inverse kinematics or other control logic
        actuator_msg.data = [cmd * 0.9 for cmd in msg.data] # Simple pass-through with scale
        self.publisher_.publish(actuator_msg)
        # self.get_logger().info(f'Publishing actuator commands: {actuator_msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = ControllerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Create Actuator Node (Simulator Interface - `simulator_interface_node.py`)

```python
# book/examples/01_ros2/package_ros2_baseline/simulator_interface_node.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32MultiArray

class SimulatorInterfaceNode(Node):
    def __init__(self):
        super().__init__('simulator_interface_node')
        self.subscription = self.create_subscription(
            Float32MultiArray,
            'actuator_commands',
            self.listener_callback,
            10)
        self.subscription # prevent unused variable warning
        self.get_logger().info('Simulator Interface node started.')

    def listener_callback(self, msg):
        self.get_logger().info(f'Simulating joint movements with commands: {msg.data}')
        # Placeholder: In a real system, these commands would be sent to a robot simulator (e.g., Gazebo)
        # or directly to hardware actuators.

def main(args=None):
    rclpy.init(args=args)
    node = SimulatorInterfaceNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Run the Nodes

Open three separate terminal windows in your `~/ros2_ws` directory and run the following commands, ensuring you've sourced your workspace (`source install/setup.bash`) in each:

**Terminal 1 (Teleop Node)**:
```bash
ros2 run package_ros2_baseline teleop_node
```

**Terminal 2 (Controller Node)**:
```bash
ros2 run package_ros2_baseline controller_node
```

**Terminal 3 (Simulator Interface Node)**:
```bash
ros2 run package_ros2_baseline simulator_interface_node
```

You should see output in Terminal 3 indicating that the simulator is receiving and processing the joint commands.

## Example: Minimal `package.xml`

```xml
<!-- book/examples/01_ros2/package_ros2_baseline/package.xml -->

<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>package_ros2_baseline</name>
  <version>0.0.0</version>
  <description>TODO: Package description</description>
  <maintainer email="user@todo.todo">User</maintainer>
  <license>TODO: License declaration</license>

  <depend>rclpy</depend>
  <depend>std_msgs</depend>

  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>
  <test_depend>ament_pep257</test_depend>
  <test_depend>python3-pytest</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

## Example: Minimal `setup.py`

```python
# book/examples/01_ros2/package_ros2_baseline/setup.py

from setuptools import find_packages, setup

package_name = 'package_ros2_baseline'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/launch', ['launch/example.launch.py']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='User',
    maintainer_email='user@todo.todo',
    description='TODO: Package description',
    license='TODO: License declaration',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'teleop_node = package_ros2_baseline.teleop_node:main',
            'controller_node = package_ros2_baseline.controller_node:main',
            'simulator_interface_node = package_ros2_baseline.simulator_interface_node:main',
        ],
    },
)
```

## Example: Minimal `example.launch.py`

```python
# book/examples/01_ros2/package_ros2_baseline/launch/example.launch.py

from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='package_ros2_baseline',
            executable='teleop_node',
            name='teleop_node',
            output='screen'),
        Node(
            package='package_ros2_baseline',
            executable='controller_node',
            name='controller_node',
            output='screen'),
        Node(
            package='package_ros2_baseline',
            executable='simulator_interface_node',
            name='simulator_interface_node',
            output='screen'),
    ])
```

