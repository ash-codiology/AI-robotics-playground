import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import { useUser } from '../../contexts/UserContext';
import Link from '@docusaurus/Link';
import styles from './navbar.module.css';

const CustomNavbar = (props) => {
  const { user, logout } = useUser();

  return (
    <OriginalNavbar
      {...props}
      items={[
        ...props.items,
        ...(user
          ? [
              {
                type: 'dropdown',
                label: (
                  <div className={styles.profileIcon}>
                    <svg
                      className={styles.avatarIcon}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ),
                position: 'right',
                items: [
                  {
                    label: `Signed in as ${user.name}`,
                    type: 'html',
                    className: styles.dropdownHeader,
                  },
                  {
                    type: 'divider',
                  },
                  {
                    label: 'Profile',
                    to: '#', // In a real app, this would link to the user's profile page
                    onClick: (e) => {
                      e.preventDefault();
                      // In a real app, navigate to profile page
                    },
                  },
                  {
                    label: 'Settings',
                    to: '#', // In a real app, this would link to settings page
                    onClick: (e) => {
                      e.preventDefault();
                      // In a real app, navigate to settings page
                    },
                  },
                  {
                    type: 'divider',
                  },
                  {
                    label: 'Sign Out',
                    to: '#',
                    className: styles.signOutButton,
                    onClick: (e) => {
                      e.preventDefault();
                      logout();
                    },
                  },
                ],
              }
            ]
          : [
              {
                type: 'dropdown',
                label: 'Sign In',
                position: 'right',
                items: [
                  {
                    label: 'Sign In',
                    to: '/login',
                    activeBaseRegex: '/login',
                  },
                  {
                    label: 'Sign Up',
                    to: '/login',
                    activeBaseRegex: '/login',
                  },
                ],
              }
            ]
        ),
      ]}
    />
  );
};

export default CustomNavbar;