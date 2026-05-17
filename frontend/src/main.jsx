import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Bootstrap Icons (npm package — CDN fallback also in index.html)
import 'bootstrap-icons/font/bootstrap-icons.css';

// Master stylesheet — imports Bootstrap + all custom SCSS
import './styles/main.scss';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
