import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home= () => {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Ruang Meeting</h1>
          <p className="breadcrumb">Ruang Meeting</p>
        </div>
        <button onClick={() => navigate('/pesan-ruangan')} className="btn btn-primary">+ Pesan Ruangan</button>
      </div>

    </div>
  );
};

export default Home;