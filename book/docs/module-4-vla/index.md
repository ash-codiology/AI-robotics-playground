---
id: module-4-vla
title: Vision-Language-Action (VLA)
sidebar_position: 5
---

# Module 4: Vision-Language-Action (VLA)

## Purpose

This module explores how to connect language models, perception, and motion to enable natural-language-controlled humanoid behavior. You will learn to implement Vision-Language-Action (VLA) systems, which are crucial for intuitive human-robot interaction and advanced autonomous capabilities. We will build an end-to-end example that translates voice commands into robot actions in a simulated environment.

## Key Concepts

1.  **Automatic Speech Recognition (ASR)**: Converting spoken language into text (e.g., using Whisper).
2.  **Large Language Models (LLMs)**: Utilizing LLMs to interpret natural language commands and generate symbolic plans or action sequences.
3.  **Symbolic Plan Generation**: Translating high-level human instructions into a structured, executable sequence of robot actions.
4.  **ROS Action Graph**: Representing complex robot behaviors as a series of interconnected ROS 2 actions.
5.  **Safety & Verification**: Implementing mechanisms to ensure VLA systems operate safely and predictably, including guardrails and human oversight.

## Learning Outcomes

Upon completing this module, you will be able to:

-   Understand the typical pipeline of a Vision-Language-Action system.
-   Integrate an ASR system (like Whisper) to process voice commands.
-   Design prompts for LLMs to generate actionable robot plans.
-   Map LLM outputs to ROS 2 actions and execute them on a robot.
-   Consider safety implications and basic verification strategies for VLA systems.

## Tooling

This module primarily uses the following tools and libraries:

-   **Whisper Audio Pipeline**: A robust ASR system for converting speech to text.
-   **Chosen LLM Client**: Integration with a local or API-based Large Language Model (e.g., OpenAI, Hugging Face).
-   **Executor Patterns in ROS 2**: Techniques for reliably executing sequences of ROS 2 actions, including error handling and retries.

## Implementation Walkthrough: WAV → Transcript → Templated Prompt → Deterministic Plan → ROS Action Sequence

This walkthrough demonstrates a full VLA pipeline that takes a recorded WAV audio file, transcribes it, uses an LLM to interpret the command, and executes a corresponding ROS 2 action sequence on a simulated humanoid.

### Step 1: Set up ASR (Whisper) and LLM Client

Install Whisper (e.g., `pip install openai-whisper`) and your chosen LLM client library (e.g., `pip install openai`).

### Step 2: Record a Sample Audio Command

Create a `.wav` file with a simple command, e.g., "robot, place the red cup on the table."

### Step 3: Implement ASR Node (`asr_node.py`)

Create a ROS 2 node that subscribes to an audio topic, uses Whisper to transcribe it, and publishes the text to a new topic.

```python
# book/examples/04_vla/whisper_examples/asr_node.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
# import whisper # Assuming whisper is installed

class ASRNode(Node):
    def __init__(self):
        super().__init__('asr_node')
        self.publisher_ = self.create_publisher(String, 'speech_text', 10)
        self.audio_subscription = self.create_subscription(
            String, # Placeholder for actual audio message type
            'audio_input',
            self.audio_callback,
            10)
        # self.model = whisper.load_model("base") # Load Whisper model
        self.get_logger().info('ASR Node started.')

    def audio_callback(self, msg):
        # Placeholder: Process audio message (e.g., save to temp WAV, run Whisper)
        # audio_data = msg.data # Assume raw audio data
        # result = self.model.transcribe("temp_audio.wav")
        # transcribed_text = result["text"]
        transcribed_text = "robot place the red cup on the table" # Simulated transcription

        text_msg = String()
        text_msg.data = transcribed_text
        self.publisher_.publish(text_msg)
        self.get_logger().info(f'Transcribed: "{transcribed_text}"')

def main(args=None):
    rclpy.init(args=args)
    node = ASRNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Implement LLM Planner Node (`llm_planner_node.py`)

Create a node that subscribes to the `speech_text` topic, uses an LLM with a templated prompt to generate a symbolic plan, and publishes it as a ROS 2 action goal.

```python
# book/examples/04_vla/llm_planner_examples/llm_planner_node.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
# from openai import OpenAI # Example LLM client

class LLMPlannerNode(Node):
    def __init__(self):
        super().__init__('llm_planner_node')
        self.subscription = self.create_subscription(
            String,
            'speech_text',
            self.listener_callback,
            10)
        self.publisher_ = self.create_publisher(String, 'robot_action_goal', 10)
        # self.llm_client = OpenAI() # Initialize LLM client
        self.get_logger().info('LLM Planner Node started.')

    def listener_callback(self, msg):
        command = msg.data
        self.get_logger().info(f'Received command: "{command}"')

        # Templated prompt for LLM
        prompt = f"""You are a robot task planner. Convert the following human command into a JSON array of simple robot actions. Actions available: ["pick_object", "place_object", "move_to_location"].
        Example: {\"command\": \"robot place the red cup on the table\", \"plan\": [{\"action\":\"pick_object\",\"object\":\"red cup\"},{\"action\":\"move_to_location\",\"location\":\"table\"},{\"action\":\"place_object\",\"object\":\"red cup\",\"location\":\"table\"}]}
        Now, convert: {\"command\": \"{command}\", \"plan\": """

        # Placeholder: Call LLM API here
        # response = self.llm_client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[{"role": "user", "content": prompt}]
        # )
        # raw_plan_json = response.choices[0].message.content

        # Simulated LLM response
        if "red cup on the table" in command:
            raw_plan_json = '[{\"action\":\"pick_object\",\"object\":\"red cup\"},{\"action\":\"move_to_location\",\"location\":\"table\"},{\"action\":\"place_object\",\"object\":\"red cup\",\"location\":\"table\"}]'
        else:
            raw_plan_json = '[]' # Empty plan for unknown commands

        action_msg = String()
        action_msg.data = raw_plan_json
        self.publisher_.publish(action_msg)
        self.get_logger().info(f'Published plan: {raw_plan_json}')

def main(args=None):
    rclpy.init(args=args)
    node = LLMPlannerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Implement Action Executor Node (`action_executor_node.py`)

Create a node that subscribes to the `robot_action_goal` topic, parses the JSON plan, and sequentially calls corresponding ROS 2 actions.

```python
# book/examples/04_vla/action_executor_examples/action_executor_node.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import json
# from rcl_interfaces.msg import SetParametersResult # For real ROS2 actions

class ActionExecutorNode(Node):
    def __init__(self):
        super().__init__('action_executor_node')
        self.subscription = self.create_subscription(
            String,
            'robot_action_goal',
            self.listener_callback,
            10)
        self.get_logger().info('Action Executor Node started.')

    def execute_action(self, action):
        # Placeholder: In a real system, this would involve calling ROS 2 action clients
        self.get_logger().info(f'Executing action: {action}')
        # Example: if action["action"] == "pick_object":
        #   # Call pick_object ROS2 action client
        # time.sleep(2) # Simulate action duration
        self.get_logger().info(f'Action {action["action"]} completed.')

    def listener_callback(self, msg):
        raw_plan_json = msg.data
        self.get_logger().info(f'Received plan: {raw_plan_json}')

        try:
            plan = json.loads(raw_plan_json)
            for action in plan:
                self.execute_action(action)
            self.get_logger().info('Plan execution complete.')
        except json.JSONDecodeError:
            self.get_logger().error(f'Failed to parse JSON plan: {raw_plan_json}')

def main(args=None):
    rclpy.init(args=args)
    node = ActionExecutorNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 6: Run the VLA Pipeline

1.  **Launch the ASR Node** (in a terminal in `~/ros2_ws`):
    ```bash
    ros2 run package_vla_baseline asr_node
    ```
2.  **Launch the LLM Planner Node** (in another terminal):
    ```bash
    ros2 run package_vla_baseline llm_planner_node
    ```
3.  **Launch the Action Executor Node** (in a third terminal):
    ```bash
    ros2 run package_vla_baseline action_executor_node
    ```
4.  **Simulate audio input**: The `asr_node.py` currently has a simulated transcription. In a real scenario, you would feed audio data into it.

Observe the output in the terminals. You should see the ASR node transcribing, the LLM planner generating a plan, and the action executor simulating the execution of robot actions.
