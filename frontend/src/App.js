import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TrackerPage from './TrackerPage';
import './theme.css';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track/:plate" element={<TrackerPage />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;