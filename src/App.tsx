import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import ListProfiles from './pages/ListProfiles';

const App: React.FC = () => {
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/list-profiles" element={<ListProfiles />} />
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
