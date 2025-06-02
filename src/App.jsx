import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Upload from './pages/Upload/Upload.jsx';
import Preferences from './pages/Preferences/preferences.jsx';
import AnalysisDetail from './pages/AnalysisDetail/AnalysisDetail.jsx';

import AppNavbar from './components/Navbar/Navbar.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';

import AuthWrapper from './components/AuthWrapper/AuthWrapper.jsx';

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  const AuthenticatedApp = () => (
    <>
      <AppNavbar
        onHistoryClick={() => setShowSidebar(true)}
      />

      <Sidebar
        show={showSidebar}
        toggle={() => setShowSidebar(false)}
        selectedId={selectedAnalysisId}
        setSelectedId={(id) => {
          setSelectedAnalysisId(id);
          setShowSidebar(false);
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
      </Routes>
    </>
  );


  return (
    <Router>
      <AuthWrapper>
        <AuthenticatedApp />
      </AuthWrapper>
    </Router>
  );
}

export default App;