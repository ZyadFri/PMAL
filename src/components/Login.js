import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

const Login = () => {
  const { keycloak } = useKeycloak();

  const handleLogin = () => {
    keycloak.login();
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        minWidth: '300px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
          PMAL Login
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Please sign in to access your account
        </p>
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Sign In with Keycloak
        </button>
      </div>
    </div>
  );
};

export default Login;