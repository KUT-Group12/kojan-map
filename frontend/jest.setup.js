import '@testing-library/jest-dom';

Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { VITE_API_URL: 'http://localhost:8080' } } },
});
