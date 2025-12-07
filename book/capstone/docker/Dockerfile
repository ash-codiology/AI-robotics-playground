# book/capstone/docker/Dockerfile
# Dockerfile for the Capstone Project

# Use a base image with ROS 2 Humble pre-installed (e.g., official ROS 2 image)
FROM ros:humble-ros-base

# Set the working directory
WORKDIR /ros2_ws

# Install development tools and dependencies
RUN apt-get update && apt-get install -y \
    python3-pip \
    git \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies (for LLM client, ASR, etc.)
# Assuming these are in a requirements.txt in the root of the capstone folder
COPY requirements.txt .
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Copy the entire workspace
COPY . /ros2_ws/src/physical_ai_robotics_textbook

# Build the ROS 2 workspace
RUN /bin/bash -c "source /opt/ros/humble/setup.bash && \
    cd /ros2_ws && \
    rosdep install -i --from-path src --rosdistro humble -y && \
    colcon build --symlink-install"

# Source the ROS 2 setup file
CMD ["/bin/bash", "-c", "source /opt/ros/humble/setup.bash && source /ros2_ws/install/setup.bash && ros2 launch physical_ai_robotics_textbook capstone_launch.py"]
