/**
 * Simple test script to verify the API integration
 * Run this with: node test-api.js
 */

const API_BASE_URL = 'http://localhost:8000';
const APP_NAME = 'root_agent';

async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test 1: Check if API server is running
    const listResponse = await fetch(`${API_BASE_URL}/list-apps`);
    if (!listResponse.ok) {
      throw new Error(`API server not responding: ${listResponse.statusText}`);
    }
    
    const apps = await listResponse.json();
    console.log('✅ Available agents:', apps);
    
    // Test 2: Create a test session
    const userId = 'test_user_123';
    const sessionId = 'test_session_456';
    
    console.log('Creating test session...');
    const sessionResponse = await fetch(
      `${API_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: { test: true } }),
      }
    );
    
    if (!sessionResponse.ok) {
      throw new Error(`Failed to create session: ${sessionResponse.statusText}`);
    }
    
    const session = await sessionResponse.json();
    console.log('✅ Session created:', session.id);
    
    // Test 3: Send a test message
    console.log('Sending test message...');
    const messageResponse = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_name: APP_NAME,
        user_id: userId,
        session_id: sessionId,
        new_message: {
          role: 'user',
          parts: [{ text: 'Please register this user with email: test@example.com, age: 25, gender: male' }]
        },
        streaming: false
      }),
    });
    
    if (!messageResponse.ok) {
      throw new Error(`Failed to send message: ${messageResponse.statusText}`);
    }
    
    const result = await messageResponse.json();
    console.log('✅ Message sent successfully');
    console.log('Response events:', result.events?.length || 0, 'events received');
    
    console.log('\n🎉 All tests passed! The API integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the ADK API server is running:');
    console.log('cd /Users/nithinteekaramanaa/Documents/zoi/projects/Zoi/zoi-agentic-era-hackathon');
    console.log('adk api_server');
  }
}

// Run the test
testApiConnection();
