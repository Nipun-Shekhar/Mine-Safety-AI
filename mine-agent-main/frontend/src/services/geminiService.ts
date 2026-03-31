export async function getChatResponse(message: string, history: { role: string; parts: { text: string }[] }[]) {
  try {
    const response = await fetch('https://krishnasimha-mine-agent.hf.space/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error querying backend:', error);
    return 'Error: Unable to connect to the Mine Agent backend.';
  }             
}
        