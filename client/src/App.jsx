import { useState } from 'react';
import { makeBackendRequest } from './utils/makeBackendRequest';

function App() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleRequest = async () => {
    setResponse(null);
    setError(null);
    try {
      const result = await makeBackendRequest('testRequest', { key: 'value' + Date.now() }, (chunk) => {
        console.log('Streaming chunk:', chunk);
      });
      console.log('Final result:', result);
      setResponse(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={handleRequest} style={{ marginBottom: '10px' }}>
        Send Test Request
      </button>
      <div>
        {response && <p style={{ color: 'white' }}>Response: {JSON.stringify(response)}</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    </div>
  );
}

export default App;
