import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BookingForm from './pages/BookingForm';
import './App.css';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pesan-ruangan" element={<BookingForm />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;