import React, { useEffect, useState } from 'react';
import { getSummaryBookings } from '../api/index';
import './Dashboard.css';
import dash from '../assets/Vector.png'
import generation from '../assets/Generation.png'

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('Jan-2024'); 

  useEffect(() => {
    getSummaryBookings()
      .then((res) => {
       
        const summaryData = res.data.find(item => item.period === period);
        
        if (summaryData) {
          
          const flatData = summaryData.data.flatMap(office =>
            office.detailSummary.map(room => ({
              ...room,
              officeName: office.officeName 
            }))
          );
          setData(flatData);
        } else {
          setData([]); 
        }
      })
      .catch((err) => console.error(err, 'gagal mengambil data summaryBookings'));
  }, [period]);

  const groupedData = data.reduce((acc, item) => {
  
    if (!acc[item.officeName]) acc[item.officeName] = [];
    acc[item.officeName].push(item);
    return acc;
  }, {});

  
  const getConsumptionValue = (consumptions, name, key) => {
    const item = consumptions.find(c => c.name === name);
    return item ? parseInt(item[key]) : 0;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className='title'>
          <img src={dash}></img>
          <h1>Dashboard</h1>
        </div>
        
      </div>
      <div className='page-select'>
        <h3>Periode</h3>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option>Jan-2024</option>
          <option>Feb-2024</option>
          {/* Tambahkan opsi period lainnya sesuai data API */}
        </select>
      </div>
    
    <div className='dashboard-grid'>
      <div className="dashboardGrid">
        {Object.entries(groupedData).map(([office, rooms]) => (
          <div key={office} className="unit-column">
            <div className='office-wrap'>
            <img src={generation}></img>
            <h3>{office}</h3>
            
            </div>
            {rooms.map((room, index) => {
              const snackSiang = getConsumptionValue(room.totalConsumption, 'Snack Siang', 'totalPackage');
              const makanSiang = getConsumptionValue(room.totalConsumption, 'Makan Siang', 'totalPackage');
              const snackSore = getConsumptionValue(room.totalConsumption, 'Snack Sore', 'totalPackage');

              const totalNominal = room.totalConsumption.reduce((sum, item) => sum + parseInt(item.totalPrice), 0);
              const percentageUsage = (room.averageOccupancyPerMonth / room.capacity) * 100;

              return (
                <div key={`${office}-${room.roomName}-${index}`} className="dashboard-card">
                  <h4>{room.roomName}</h4>
                  <div className="card-body">
                    <div className="usage-details">
                      <p className="label">Persentase Pemakaian</p>
                      <p className="percentage-value">
                        {percentageUsage.toFixed(2)}%
                      </p>
                      <p className="label">Nominal Konsumsi</p>
                      <h3 className="nominal-value">
                        Rp {totalNominal.toLocaleString('id-ID')}
                      </h3>
                    </div>
                    <div
                      className="progress-circle"
                      style={{ '--value': percentageUsage }}
                    >
                      <div className="progress-circle-inner">
                        {`${percentageUsage.toFixed(0)}%`}
                      </div>
                    </div>
                  </div>

                  <div className="consumption-bars">
                    <div className="bar-item">
                      <label>Snack Siang</label>
                      <div className='progres-item'>

                      <span>{snackSiang}</span>
                      <progress value={snackSiang} max="280"></progress>
                      </div>
                      
                    </div>
                    <div className="bar-item">
                      <label>Makan Siang</label>

                    <div className='progres-item'>

                      <span>{makanSiang}</span>
                      <progress value={makanSiang} max="280"></progress>
                    
                    </div>
                    </div>
                    <div className="bar-item">
                      <label>Snack Sore</label>
                      <div className='progres-item'>

                      <span>{snackSore}</span>
                      <progress value={snackSore} max="280"></progress>
                      
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;