import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import './App.css'; 
import Navbar from './components/Navbar/Navbar';
import Voting from './components/voting/Voting';

const App = () => {
  return (
    <>
    <Navbar />
      <Routes>
        <Route path="/" element={<Voting />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      </>
    
  );
}

export default App;
