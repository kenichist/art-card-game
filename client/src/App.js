import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import HomeScreen from './screens/HomeScreen';
import ItemsScreen from './screens/ItemsScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import CollectorsScreen from './screens/CollectorsScreen';
import CollectorDetailScreen from './screens/CollectorDetailScreen';
import AuctionScreen from './screens/AuctionScreen';
import UploadScreen from './screens/UploadScreen';
import CustomizationScreen from './screens/CustomizationScreen';
import { LanguageProvider } from './contexts/LanguageContext';

const App = () => {
  const location = useLocation();

  return (
    <LanguageProvider>
      <Header />
      <main className="py-3">
        <Container>
          <PageTransition>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomeScreen />} exact />
              <Route path="/items" element={<ItemsScreen />} />
              <Route path="/items/:id" element={<ItemDetailScreen />} />
              <Route path="/collectors" element={<CollectorsScreen />} />
              <Route path="/collectors/:id" element={<CollectorDetailScreen />} />
              <Route path="/auction" element={<AuctionScreen />} />
              <Route path="/upload" element={<UploadScreen />} />
              <Route path="/customization" element={<CustomizationScreen />} />
            </Routes>
          </PageTransition>
        </Container>
      </main>
      <Footer />
    </LanguageProvider>
  );
};

export default App;
