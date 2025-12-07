# DEPLOY.md

This document outlines the deployment instructions for the Physical AI & Humanoid Robotics textbook website (Docusaurus) and the Capstone Project's Dockerized environment.

## 1. Docusaurus Website Deployment (to GitHub Pages)

The textbook website is built using Docusaurus and deployed to GitHub Pages. The deployment process is automated via GitHub Actions, as configured in `.github/workflows/deploy.yml`.

### Prerequisites

-   Node.js (LTS version) and npm installed.
-   Access to the GitHub repository with appropriate permissions for GitHub Pages.

### Local Build & Serve (for testing)

To build the Docusaurus site locally and serve it:

1.  **Install Dependencies**:
    ```bash
    cd book
    npm install
    ```

2.  **Build Site**:
    ```bash
    npm run build
    ```
    The static site will be generated in the `book/build` directory.

3.  **Serve Locally**:
    ```bash
    npm run serve
    ```
    This will serve the built site, typically accessible at `http://localhost:3000`.

### Deploying to GitHub Pages

Deployment to GitHub Pages is automatically handled by the `deploy.yml` GitHub Actions workflow upon pushing changes to the `main` branch.

1.  **Configure GitHub Pages**: Ensure GitHub Pages is configured in your repository settings to deploy from the `gh-pages` branch.

2.  **Push to Main**: Any commit pushed to the `main` branch will trigger the `deploy.yml` workflow, which will:
    -   Check out the repository.
    -   Set up Node.js.
    -   Install Docusaurus dependencies.
    -   Build the Docusaurus site.
    -   Deploy the built site to the `gh-pages` branch.

    The website will then be accessible at your configured GitHub Pages URL (e.g., `https://<username>.github.io/<repository-name>/`).

## 2. Capstone Project Docker Deployment

The Capstone Project (integrating ROS 2, Isaac, VLA) is designed to run within a Dockerized environment for reproducibility. The `docker-compose.yml` file orchestrates the necessary services.

### Prerequisites

-   Docker and Docker Compose installed.
-   NVIDIA Container Toolkit (if running on a host with an NVIDIA GPU for Isaac components).

### Building the Docker Image

1.  **Navigate to Capstone Directory**:
    ```bash
    cd book/capstone
    ```

2.  **Build the Image**:
    ```bash
    docker-compose build
    ```
    This will build the `physical-ai-robotics-capstone:latest` image based on the `docker/Dockerfile`.

### Running the Capstone Project

1.  **Start Services**:
    ```bash
    cd book/capstone
    docker-compose up
    ```
    This command will start the `robot_system` service defined in `docker-compose.yml`, which in turn launches the Capstone's primary ROS 2 launch file (`capstone_launch.py`).

2.  **Run in Detached Mode (Background)**:
    ```bash
    cd book/capstone
    docker-compose up -d
    ```
    To run the services in the background. You can then use `docker-compose logs` to view output.

3.  **Stopping Services**:
    ```bash
    cd book/capstone
    docker-compose down
    ```
    To stop and remove the containers, networks, and volumes created by `up`.

### NVIDIA GPU Support (Important for Isaac Sim)

If you are using NVIDIA Isaac Sim or other GPU-accelerated components within the Docker container, ensure your Docker setup is configured for NVIDIA GPU passthrough. This typically involves installing the NVIDIA Container Toolkit and running Docker commands with `--gpus all` (though `docker-compose.yml` is configured for `privileged: true` and environment variables to handle this).

---

**Note**: Always refer to the specific `book/VERSIONS.md` for exact software versions to ensure a consistent deployment environment.
