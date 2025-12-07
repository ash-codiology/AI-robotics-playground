import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';
import HomepageFeatures from '../components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">Your journey into the future of intelligent machines begins here.</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
                                to={useBaseUrl('/introduction')}>            Get Started - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className={clsx('col col--12')}>
                <h2>About the Course</h2>
                <p>
                  This comprehensive course explores the exciting convergence of Artificial Intelligence and Robotics, focusing on the principles and applications of Physical AI and Humanoid Robotics.
                  You will gain practical skills and theoretical knowledge to design, program, and interact with intelligent robotic systems.
                  Prepare to delve into cutting-edge topics that will shape the next generation of automation and human-robot collaboration.
                  This course is ideal for aspiring roboticists, AI enthusiasts, and engineers looking to specialize in intelligent autonomous systems.
                </p>

                <h2>What you'll learn:</h2>
                <ul>
                  <li>Develop foundational understanding of ROS2 for robot operating systems.</li>
                  <li>Master simulation environments for testing and validating robotic systems.</li>
                  <li>Explore NVIDIA Isaac Sim for advanced robotics simulation and development.</li>
                  <li>Understand Vision-Language-Action (VLA) models for robotic perception and control.</li>
                  <li>Grasp the foundations of embodied intelligence and its applications.</li>
                  <li>Learn about cognitive motion planning and autonomous behavior.</li>
                  <li>Examine human-robot interaction safety frameworks and best practices.</li>
                  <li>Delve into whole-body kinematics, dynamics, and control systems.</li>
                </ul>

                <h2>Course Modules:</h2>
                <ul>
                  <li><strong>Module 01: ROS2 Fundamentals</strong> - Core concepts, tools, and best practices for building robust robotic applications.</li>
                  <li><strong>Module 02: Robotic Simulation</strong> - Creating, configuring, and deploying robots in virtual environments for testing.</li>
                  <li><strong>Module 03: NVIDIA Isaac Sim</strong> - Leveraging advanced simulation platforms for realistic robot development.</li>
                  <li><strong>Module 04: Vision-Language-Action Models</strong> - Integrating visual perception, language understanding, and physical actions.</li>
                  <li><strong>Module 05: Foundations of Embodied Intelligence</strong> - Understanding how intelligence emerges from physical interaction with the world.</li>
                  <li><strong>Module 06: Cognitive Motion Planning & Autonomous Behavior</strong> - Designing intelligent navigation and decision-making for robots.</li>
                  <li><strong>Module 07: Human-Robot Interaction & Safety Frameworks</strong> - Ensuring safe and intuitive collaboration between humans and robots.</li>
                  <li><strong>Module 08: Whole-Body Kinematics, Dynamics & Control Systems</strong> - Advanced control techniques for complex multi-joint robotic systems.</li>
                </ul>

                <h2>Capstone Project:</h2>
                <p>Apply your acquired knowledge to a real-world robotics challenge, integrating various course concepts into a functional project.</p>

                <div className={styles.buttons}>
                  <Link
                    className="button button--primary button--lg"
                    to={useBaseUrl('/introduction')}>
                    Course Introduction
                  </Link>
                  <Link
                    className="button button--primary button--lg"
                    to={useBaseUrl('/category/modules')}>
                    Explore Modules
                  </Link>
                </div>

                <h2>See Also:</h2>
                <ul>
                  <li><a href="https://github.com/ahundt/awesome-robotics" target="_blank" rel="noopener noreferrer">Awesome Robotics List</a> - A curated list of awesome robotics resources.</li>
                  <li><a href="https://robotics.stackexchange.com/" target="_blank" rel="noopener noreferrer">The Robotics Forum</a> - Q&A site for robotics enthusiasts and professionals.</li>
                  <li><a href="https://www.openrobotics.org/" target="_blank" rel="noopener noreferrer">Open Robotics</a> - Organization supporting open source robotics software.</li>
                </ul>

                <footer>
                  <p>By Ashfa Shakeel</p>
                </footer>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}