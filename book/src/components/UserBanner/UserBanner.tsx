import React from 'react';
import { useUser, useLogout } from '../../contexts/UserContext';
import styles from './UserBanner.module.css';

const UserBanner: React.FC = () => {
  const { user } = useUser();
  const logout = useLogout();

  if (!user) {
    return null; // Don't render if user is not logged in
  }

  return (
    <div className={styles.userBanner}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <div className={styles.userInfo}>
              <span className={styles.userName}>Welcome, {user.name}</span>
              <button
                onClick={logout}
                className={styles.logoutButton}
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBanner;