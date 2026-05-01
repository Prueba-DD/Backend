#!/usr/bin/env node
/**
 * Test simple para diagnosticar rutas disponibles
 */

const BASE_URL = 'http://localhost:3000';

async function testRoute(method, path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { method });
    console.log(`${method} ${path}: ${response.status}`);
    return response.status;
  } catch (error) {
    console.log(`${method} ${path}: ERROR - ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Diagnosticando rutas disponibles...\n');

  // Test rutas básicas
  console.log('Rutas básicas:');
  await testRoute('GET', '/api/health');
  await testRoute('GET', '/');
  
  // Test rutas auth
  console.log('\nRutas Auth:');
  await testRoute('POST', '/api/auth/register');
  await testRoute('POST', '/api/auth/login');
  await testRoute('POST', '/api/auth/send-verification-email');
  await testRoute('GET', '/api/auth/verify-email');
  
  // Test rutas reportes
  console.log('\nRutas Reportes:');
  await testRoute('GET', '/api/reportes/mis-reportes');
  await testRoute('GET', '/api/reportes');
  await testRoute('POST', '/api/reportes');

  // Test con headers adicionales
  console.log('\nRutas con Bearer token inválido:');
  const headers = {
    'Authorization': 'Bearer invalid-token'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/send-verification-email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    console.log(`POST /api/auth/send-verification-email: ${response.status}`);
    const data = await response.json();
    console.log(`Response:`, data);
  } catch (error) {
    console.log(`Error:`, error.message);
  }
}

main().catch(console.error);
