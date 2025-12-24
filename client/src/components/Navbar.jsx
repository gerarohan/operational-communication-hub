import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">Operational Communication Hub</div>
        <div className="navbar-links">
          <Link to="/announcements">Announcements</Link>
          <Link to="/announcements/create">Create</Link>
          <Link to="/audiences">Audiences</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

