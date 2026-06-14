const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://jkanime.net/')}`;
try {
  console.log(`Testing AllOrigins GET proxy for: https://jkanime.net/`);
  const res = await fetch(url);
  console.log(`Status: ${res.status}`);
  const json = await res.json();
  const text = json.contents || '';
  console.log(`Contents Length: ${text.length}`);
  if (text.includes('Recién Actualizados') || text.includes('jkanime') || text.includes('anime')) {
    console.log('SUCCESS: Content retrieved successfully!');
    console.log(text.slice(0, 200));
  } else {
    console.log('FAILED: Content not recognized.');
    console.log(text.slice(0, 300));
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
}
