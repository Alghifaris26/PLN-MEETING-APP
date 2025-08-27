// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import home from '../assets/home.png'
const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}><img src={home}></img></Link>
          </li>
          <li>
            <Link to="/pesan-ruangan" className={`sidebar-link ${location.pathname === '/pesan-ruangan' ? 'active' : ''}`}>📄</Link>
          </li>
          <li>
            <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>📊</Link>
            
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
