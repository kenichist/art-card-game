import React, { Suspense } from 'react'; // Import Suspense
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Spinner } from 'react-bootstrap';

// Import i18n configuration
import './i18n';

// Language loading fallback component
const LanguageLoadingFallback = () => (
  <Container 
    fluid 
    className="d-flex flex-column justify-content-center align-items-center"
    style={{
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#EDB65B',
      fontFamily: 'MedievalSharp, cursive',
    }}
  >
    <h2 className="mb-4" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
      Loading Language Resources...
    </h2>
    <Spinner animation="border" role="status" variant="warning" style={{ width: '3rem', height: '3rem' }}>
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </Container>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Suspense fallback={<LanguageLoadingFallback />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  // </React.StrictMode>
);