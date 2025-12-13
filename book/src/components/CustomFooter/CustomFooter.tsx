import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './CustomFooter.module.css';

const CustomFooter: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          <div className="col col--3">
            <h4 className={styles.footerTitle}>{siteConfig.title}</h4>
            <p className={styles.footerDescription}>
              {siteConfig.tagline}
            </p>
          </div>

          <div className="col col--3">
            <h4 className={styles.footerTitle}>Courses</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/introduction">Introduction to Physical AI</Link></li>
              <li><Link to="/module-1-ros2">ROS 2 Fundamentals</Link></li>
              <li><Link to="/module-2-simulation">Robotic Simulation</Link></li>
              <li><Link to="/module-3-isaac">NVIDIA Isaac Sim</Link></li>
            </ul>
          </div>

          <div className="col col--3">
            <h4 className={styles.footerTitle}>Resources</h4>
            <ul className={styles.footerLinks}>
              <li><Link to="/docs/category/appendices">Appendices</Link></li>
              <li><Link to="/capstone/capstone">Capstone Project</Link></li>
              <li><a href="https://github.com/ahundt/awesome-robotics" target="_blank" rel="noopener noreferrer">Awesome Robotics</a></li>
              <li><a href="https://robotics.stackexchange.com/" target="_blank" rel="noopener noreferrer">Robotics Forum</a></li>
            </ul>
          </div>

          <div className="col col--3">
            <h4 className={styles.footerTitle}>Connect</h4>
            <ul className={styles.footerLinks}>
              <li><a href="https://github.com/ash-codiology/AI-robotics-playground" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://discord.gg/robotics" target="_blank" rel="noopener noreferrer">Discord</a></li>
              <li><Link to="/login">Account</Link></li>
              <li><Link to="/login">Subscribe</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className="row">
            <div className="col col--6">
              <p className={styles.copyright}>
                {siteConfig.themeConfig.footer.copyright?.replace(
                  /\{new Date\(\)\.getFullYear\(\)\}/g,
                  new Date().getFullYear().toString()
                )}
              </p>
            </div>
            <div className="col col--6">
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Twitter" className={styles.socialLink}>
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" aria-label="GitHub" className={styles.socialLink}>
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.485 0-.236-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.089 2.91.833.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.424 22 16.696 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className={styles.socialLink}>
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;