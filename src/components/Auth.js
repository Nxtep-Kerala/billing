import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const credentials = [
      { username: process.env.REACT_APP_USERNAME, password: process.env.REACT_APP_PASSWORD },
      { username: process.env.REACT_APP_USERNAME1, password: process.env.REACT_APP_PASSWORD1 },
      { username: process.env.REACT_APP_USERNAME2, password: process.env.REACT_APP_PASSWORD2 },
      { username: process.env.REACT_APP_USERNAME3, password: process.env.REACT_APP_PASSWORD3 },
      { username: process.env.REACT_APP_USERNAME4, password: process.env.REACT_APP_PASSWORD4 }
    ];
    const isValid = credentials.some(cred => cred.username === username && cred.password === password);

    if (isValid) {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="header">Secure Login</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="inputGroup">
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="input"
            />
          </div>
          <div className="inputGroup">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="input"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button">Login</button>
        </form>
        <p className="footer">Login for Invoice App</p>
      </div>
    </div>
  );
};

export default Auth;
