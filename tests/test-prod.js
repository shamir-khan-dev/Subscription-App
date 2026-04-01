const targetUrl = 'https://subscription-app-roow.onrender.com';
const uniqueEmail = `live_test_${Date.now()}@example.com`;

async function runLiveTest() {
  console.log('🚀 Starting Live Production Server Test...');
  console.log(`URL: ${targetUrl}`);

  try {
    // 1. Check Root Endpoint
    const rootRes = await fetch(`${targetUrl}/`);
    const rootText = await rootRes.text();
    console.log(`\n✅ 1. Root Endpoint Status: ${rootRes.status}`);
    console.log(`   Response: ${rootText}`);

    // 2. Register New User
    console.log(`\n⏳ 2. Registering new user (${uniqueEmail})...`);
    const registerRes = await fetch(`${targetUrl}/api/v1/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({
        name: 'Live Test User',
        email: uniqueEmail,
        password: 'securepassword123'
      })
    });
    
    // Check if response is ok before returning standard text or json.
    if (!registerRes.ok) {
       console.error(`❌ Registration HTTP error: ${registerRes.status}`);
       console.error(await registerRes.text());
       return;
    }
    const registerData = await registerRes.json();
    console.log(`✅ User Registration Status: ${registerRes.status}`);
    if (!registerData.success) {
      console.error('❌ Failed to register user:', registerData);
      return;
    }
    const token = registerData.data.token;
    console.log(`   User ID created: ${registerData.data.user._id}`);
    console.log(`   Auth Token received!`);

    // 3. Create a Subscription
    console.log(`\n⏳ 3. Creating a subscription to trigger the Upstash workflow...`);
    const subRes = await fetch(`${targetUrl}/api/v1/subscriptions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        name: 'Netflix',
        price: 15.99,
        currency: 'USD',
        frequency: 'monthly',
        category: 'entertainment',
        startDate: new Date().toISOString(),
        paymentMethod: 'Credit Card' 
      })
    });
    
    if (!subRes.ok) {
       console.error(`❌ Subscription HTTP error: ${subRes.status}`);
       console.error(await subRes.text());
       return;
    }

    const subData = await subRes.json();
    console.log(`✅ Subscription Creation Status: ${subRes.status}`);
    
    if (subData.success) {
      console.log(`   Subscription ID: ${subData.data._id}`);
      console.log(`\n🎉 ALL TESTS PASSED! Your production API is working perfectly.\n`);
      console.log(`👉 Upstash should have received a ping to schedule an email reminder for this subscription.`);
    } else {
      console.error('❌ Failed to create subscription:', subData);
    }

  } catch (error) {
    console.error('❌ Test failed with an error:', error);
  }
}

runLiveTest();
