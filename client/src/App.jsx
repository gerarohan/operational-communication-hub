import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import AnnouncementList from './components/AnnouncementList';
import AnnouncementCreate from './components/AnnouncementCreate';
import AnnouncementDetail from './components/AnnouncementDetail';
import AudienceManagement from './components/AudienceManagement';
import AcknowledgePage from './components/AcknowledgePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/announcements" replace />} />
            <Route path="/announcements" element={<AnnouncementList />} />
            <Route path="/announcements/create" element={<AnnouncementCreate />} />
            <Route path="/announcements/:id" element={<AnnouncementDetail />} />
            <Route path="/acknowledge/:id" element={<AcknowledgePage />} />
            <Route path="/audiences" element={<AudienceManagement />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

