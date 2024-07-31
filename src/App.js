import React, { useState } from 'react';
import Auth from './Auth';
import InvoiceApp from './InvoiceApp';

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