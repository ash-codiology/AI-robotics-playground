import React from 'react';
import NavbarItem from '@theme/NavbarItem';
import { useUser } from '../../contexts/UserContext';
import Link from '@docusaurus/Link';

const AuthNavbarItem: React.FC = () => {
  const { user, logout } = useUser();

  if (user) {
    return (
      <div className="navbar__item navbar__item--right">
        <span className="navbar__label">Welcome, {user.name}</span>
        <button
          onClick={logout}
          className="button button--secondary button--sm"
          style={{ marginLeft: '10px' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="navbar__item navbar__item--right dropdown dropdown--hoverable dropdown--right">
      <Link to="/login" className="navbar__link">
        Account
      </Link>
      <ul className="dropdown__menu">
        <li>
          <Link className="dropdown__link" to="/login">
            Sign In
          </Link>
        </li>
        <li>
          <Link className="dropdown__link" to="/login">
            Sign Up
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AuthNavbarItem;