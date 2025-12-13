import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={clsx('container', styles.heroBackground)}>
        <div className="row">
          <div className="col col--6">
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">Your journey into the future of intelligent machines begins here.</p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to={useBaseUrl('/introduction')}>
                Get Started - 5min ⏱️
              </Link>
              <Link
                className="button button--primary button--lg margin-left--md"
                to={useBaseUrl('/category/modules')}>
                Explore Modules
              </Link>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.heroImageContainer}>
              <div className={styles.heroImage}></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function CourseOverview() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center margin-bottom--lg">
            <h2 className={styles.sectionTitle}>About the Course</h2>
            <p className={styles.sectionDescription}>
              This comprehensive course explores the exciting convergence of Artificial Intelligence and Robotics,
              focusing on the principles and applications of Physical AI and Humanoid Robotics.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col col--8 col--offset-2">
            <p>
              You will gain practical skills and theoretical knowledge to design, program, and interact with intelligent robotic systems.
              Prepare to delve into cutting-edge topics that will shape the next generation of automation and human-robot collaboration.
              This course is ideal for aspiring roboticists, AI enthusiasts, and engineers looking to specialize in intelligent autonomous systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LearningOutcomes() {
  const outcomes = [
    {
      title: "ROS2 Fundamentals",
      description: "Develop foundational understanding of ROS2 for robot operating systems.",
      icon: "🤖"
    },
    {
      title: "Robotic Simulation",
      description: "Master simulation environments for testing and validating robotic systems.",
      icon: "🎮"
    },
    {
      title: "NVIDIA Isaac",
      description: "Explore NVIDIA Isaac Sim for advanced robotics simulation and development.",
      icon: "🎬"
    },
    {
      title: "Vision-Language-Action",
      description: "Understand VLA models for robotic perception and control.",
      icon: "👁️"
    },
    {
      title: "Embodied Intelligence",
      description: "Grasp the foundations of embodied intelligence and its applications.",
      icon: "🧠"
    },
    {
      title: "Motion Planning",
      description: "Learn about cognitive motion planning and autonomous behavior.",
      icon: "🧭"
    }
  ];

  return (
    <section className={clsx(styles.section, styles.featuresSection)}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center margin-bottom--lg">
            <h2 className={styles.sectionTitle}>What You'll Learn</h2>
            <p className={styles.sectionDescription}>
              Master the essential skills needed to build intelligent robotic systems
            </p>
          </div>
        </div>
        <div className="row">
          {outcomes.map((outcome, index) => (
            <div key={index} className="col col--4 margin-bottom--lg">
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{outcome.icon}</div>
                <h3>{outcome.title}</h3>
                <p>{outcome.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseModules() {
  const modules = [
    {
      title: "Module 01: ROS2 Fundamentals",
      description: "Core concepts, tools, and best practices for building robust robotic applications.",
      link: "/module-1-ros2"
    },
    {
      title: "Module 02: Robotic Simulation",
      description: "Creating, configuring, and deploying robots in virtual environments for testing.",
      link: "/module-2-simulation"
    },
    {
      title: "Module 03: NVIDIA Isaac Sim",
      description: "Leveraging advanced simulation platforms for realistic robot development.",
      link: "/module-3-isaac"
    },
    {
      title: "Module 04: Vision-Language-Action Models",
      description: "Integrating visual perception, language understanding, and physical actions.",
      link: "/module-4-vla"
    },
    {
      title: "Module 05: Foundations of Embodied Intelligence",
      description: "Understanding how intelligence emerges from physical interaction with the world.",
      link: "/module-5-foundations-of-embodied-intelligence"
    },
    {
      title: "Module 06: Cognitive Motion Planning & Autonomous Behavior",
      description: "Designing intelligent navigation and decision-making for robots.",
      link: "/module-6-cognitive-motion-planning-autonomous-behavior"
    }
  ];

  return (
    <section className={clsx(styles.section, styles.modulesSection)}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center margin-bottom--lg">
            <h2 className={styles.sectionTitle}>Course Modules</h2>
            <p className={styles.sectionDescription}>
              Comprehensive modules covering all aspects of Physical AI and Humanoid Robotics
            </p>
          </div>
        </div>
        <div className="row">
          {modules.map((module, index) => (
            <div key={index} className="col col--4 margin-bottom--lg">
              <div className={styles.moduleCard}>
                <h3><Link to={module.link}>{module.title}</Link></h3>
                <p>{module.description}</p>
                <Link to={module.link} className={styles.moduleLink}>
                  Explore Module →
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col col--12 text--center">
            <Link
              className="button button--primary button--lg"
              to={useBaseUrl('/category/modules')}>
              View All Modules
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapstoneProject() {
  return (
    <section className={clsx(styles.section, styles.capstoneSection)}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2 text--center">
            <h2 className={styles.sectionTitle}>Capstone Project</h2>
            <p className={styles.sectionDescription}>
              Apply your acquired knowledge to a real-world robotics challenge, integrating various course concepts into a functional project.
            </p>
            <Link
              className="button button--secondary button--lg"
              to={useBaseUrl('/capstone/capstone')}>
              Explore Capstone
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Home - ${siteConfig.title}`}
      description="Physical AI & Humanoid Robotics Course - Learn about the convergence of AI and Robotics">
      <HomepageHeader />
      <main>
        <CourseOverview />
        <LearningOutcomes />
        <CourseModules />
        <CapstoneProject />
        <section className={styles.section}>
          <div className="container">
            <div className="row">
              <div className="col col--12 text--center">
                <h2>Additional Resources</h2>
                <div className={styles.resources}>
                  <Link to="https://github.com/ahundt/awesome-robotics" target="_blank" rel="noopener noreferrer">
                    Awesome Robotics List
                  </Link>
                  <Link to="https://robotics.stackexchange.com/" target="_blank" rel="noopener noreferrer">
                    The Robotics Forum
                  </Link>
                  <Link to="https://www.openrobotics.org/" target="_blank" rel="noopener noreferrer">
                    Open Robotics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}