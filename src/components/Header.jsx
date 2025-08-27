import React from 'react';
import pln from '../assets/pln.png'
import megaphone from '../assets/megaphone.png'
const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img style={{width:'38px',height:'52px'}}src={pln} alt="PLN Logo" className="logo" />
        <span className="app-name">iMeeting</span>
      </div>
      <div className="header-right">
        <a shref="#" className="contact-button">
        <img style={{height:'20px', width:'18px'}}src={megaphone}/>
           <h4>Kontak Aduan</h4>
        </a>
        
        <span className="icon">🔔</span>
        <div className="user-profile">
          <img src="https://i.pravatar.cc/40" alt="User" />
          <span>John Doe ▼</span>
        </div>
      </div>
    </header>
  );
};

export default Header;