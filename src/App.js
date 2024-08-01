import React, { useState } from 'react';
import Auth from './components/Auth';
import InvoiceApp from './components/InvoiceApp';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div>
      {isAuthenticated ? (
        <InvoiceApp />
      ) : (
        <Auth onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
};

export default App;