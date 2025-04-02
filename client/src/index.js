import React, { Suspense } from 'react'; // Import Suspense
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import i18n configuration << ADD THIS LINE
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Suspense fallback="Loading language...">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  // </React.StrictMode>
);