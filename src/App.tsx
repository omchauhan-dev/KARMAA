
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import GoalDetails from './routes/GoalDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/goal/:id" element={<GoalDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
