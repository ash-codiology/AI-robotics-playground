import React from 'react';
import Layout from '@theme/Layout';
import SearchBar from '@theme/SearchBar';
import styles from './search.module.css';

const GlobalSearchPage: React.FC = () => {
  return (
    <Layout title="Global Search" description="Search the Physical AI & Humanoid Robotics Course">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1>Search Documentation</h1>
            <div className={styles.searchContainer}>
              <SearchBar />
              <div className={styles.searchInstructions}>
                <p>Enter your search query above to find content in the Physical AI & Humanoid Robotics Course.</p>
                <ul>
                  <li>Search for specific topics like "ROS2", "simulation", "Isaac", "VLA", etc.</li>
                  <li>Find information about modules, concepts, and implementation details</li>
                  <li>Discover resources and examples related to humanoid robotics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GlobalSearchPage;