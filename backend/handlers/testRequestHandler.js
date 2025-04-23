export function handleTestRequest(payload, sendChunk) {
  console.log('Handling testRequest with payload:', payload);

  // Simulate streaming data
  sendChunk({ data: 'Chunk 1' });
  sendChunk({ data: 'Chunk 2' });
  sendChunk({ data: 'Final Chunk', isFinal: true });
}