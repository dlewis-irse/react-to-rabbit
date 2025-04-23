import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { makeBackendRequest } from './utils/makeBackendRequest';

function App() {
  const [count, setCount] = useState(0);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleRequest = async () => {
    setResponse(null);
    setError(null);
    try {
      const result = await makeBackendRequest('testRequest', { key: 'value' }, (chunk) => {
        console.log('Streaming chunk:', chunk);
      });
      setResponse(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={handleRequest} style={{ marginTop: '10px' }}>
          Send Test Request
        </button>
        {response && <p>Response: {JSON.stringify(response)}</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
