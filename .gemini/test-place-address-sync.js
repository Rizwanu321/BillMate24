#!/usr/bin/env node

/**
 * Test Script: Verify Place & Address Field Synchronization
 * 
 * This script tests that the place and address fields are properly
 * synchronized between admin create/edit and shopkeeper settings.
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Test data
const testShopkeeper = {
    email: `test.shopkeeper.${Date.now()}@example.com`,
    password: 'test123456',
    name: 'Test Shopkeeper',
    phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    businessName: 'Test Business',
    address: '123 Test Street, Building A',
    place: 'Mumbai'
};

async function testPlaceAddressSync() {
    console.log('🧪 Testing Place & Address Field Synchronization\n');

    try {
        // Step 1: Login as admin
        console.log('1️⃣  Logging in as admin...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@rms.com',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Admin login failed');
        }

        const loginData = await loginResponse.json();
        const adminToken = loginData.data.tokens.accessToken;
        console.log('✅ Admin logged in successfully\n');

        // Step 2: Create shopkeeper with place and address
        console.log('2️⃣  Creating shopkeeper with place and address...');
        console.log(`   Address: ${testShopkeeper.address}`);
        console.log(`   Place: ${testShopkeeper.place}`);

        const createResponse = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(testShopkeeper)
        });

        if (!createResponse.ok) {
            const error = await createResponse.json();
            throw new Error(`Create shopkeeper failed: ${error.message}`);
        }

        const createData = await createResponse.json();
        const shopkeeperId = createData.data._id;
        console.log('✅ Shopkeeper created successfully');
        console.log(`   ID: ${shopkeeperId}`);
        console.log(`   Address in DB: ${createData.data.address}`);
        console.log(`   Place in DB: ${createData.data.place}\n`);

        // Verify fields were saved
        if (createData.data.address !== testShopkeeper.address) {
            throw new Error('❌ Address field not saved correctly!');
        }
        if (createData.data.place !== testShopkeeper.place) {
            throw new Error('❌ Place field not saved correctly!');
        }

        // Step 3: Login as the shopkeeper
        console.log('3️⃣  Logging in as shopkeeper...');
        const shopkeeperLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testShopkeeper.email,
                password: testShopkeeper.password
            })
        });

        if (!shopkeeperLoginResponse.ok) {
            throw new Error('Shopkeeper login failed');
        }

        const shopkeeperLoginData = await shopkeeperLoginResponse.json();
        const shopkeeperToken = shopkeeperLoginData.data.tokens.accessToken;
        console.log('✅ Shopkeeper logged in successfully\n');

        // Step 4: Update profile with new place and address
        console.log('4️⃣  Updating profile with new place and address...');
        const newAddress = '456 New Street, Floor 2';
        const newPlace = 'Delhi';
        console.log(`   New Address: ${newAddress}`);
        console.log(`   New Place: ${newPlace}`);

        const updateResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${shopkeeperToken}`
            },
            body: JSON.stringify({
                name: testShopkeeper.name,
                address: newAddress,
                place: newPlace
            })
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(`Update profile failed: ${error.message}`);
        }

        const updateData = await updateResponse.json();
        console.log('✅ Profile updated successfully');
        console.log(`   Address in DB: ${updateData.data.address}`);
        console.log(`   Place in DB: ${updateData.data.place}\n`);

        // Verify fields were updated
        if (updateData.data.address !== newAddress) {
            throw new Error('❌ Address field not updated correctly!');
        }
        if (updateData.data.place !== newPlace) {
            throw new Error('❌ Place field not updated correctly! This was the bug.');
        }

        // Step 5: Verify by fetching profile again
        console.log('5️⃣  Verifying changes by fetching profile...');
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${shopkeeperToken}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Get profile failed');
        }

        const profileData = await profileResponse.json();
        console.log('✅ Profile fetched successfully');
        console.log(`   Address: ${profileData.data.address}`);
        console.log(`   Place: ${profileData.data.place}\n`);

        if (profileData.data.address !== newAddress || profileData.data.place !== newPlace) {
            throw new Error('❌ Changes were not persisted!');
        }

        // Step 6: Cleanup - Delete test shopkeeper
        console.log('6️⃣  Cleaning up test data...');
        const deleteResponse = await fetch(`${API_BASE_URL}/users/${shopkeeperId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        if (!deleteResponse.ok) {
            console.log('⚠️  Warning: Could not delete test shopkeeper');
        } else {
            console.log('✅ Test shopkeeper deleted\n');
        }

        console.log('🎉 All tests passed! Place & Address fields are properly synchronized.\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testPlaceAddressSync();
