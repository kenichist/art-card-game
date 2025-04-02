import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ItemsScreen from './screens/ItemsScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import CollectorsScreen from './screens/CollectorsScreen';
import CollectorDetailScreen from './screens/CollectorDetailScreen';
import AuctionScreen from './screens/AuctionScreen';
import UploadScreen from './screens/UploadScreen';
import GalleryScreen from './screens/GalleryScreen';


const App = () => {
  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/items" element={<ItemsScreen />} />
            <Route path="/items/:id" element={<ItemDetailScreen />} />
            <Route path="/collectors" element={<CollectorsScreen />} />
            <Route path="/collectors/:id" element={<CollectorDetailScreen />} />
            <Route path="/auction" element={<AuctionScreen />} />
            <Route path="/upload" element={<UploadScreen />} />
            <Route path="/gallery" element={<GalleryScreen />} />
            <Route path="/gallery/item/:id" element={<GalleryScreen />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default App;
