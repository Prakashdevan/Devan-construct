const axios = require('axios');

/**
 * Utility to send WhatsApp and SMS messages via external APIs.
 * To use this, add the following to your server/.env:
 * 
 * SMS_API_KEY=your_fast2sms_key_here
 * WHATSAPP_API_URL=your_wa_api_url
 * WHATSAPP_API_KEY=your_wa_api_key
 */

const sendSMS = async (phone, message) => {
    try {
        const apiKey = process.env.SMS_API_KEY;
        if (!apiKey) {
            console.warn('[Messaging] SMS_API_KEY not found in .env. Message not sent.');
            return { success: false, message: 'API Key missing' };
        }

        // Example using Fast2SMS (Popular in India)
        // You can change this to Twilio or any other provider
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: apiKey,
                message: message,
                language: 'english',
                route: 'q',
                numbers: phone
            }
        });

        console.log('[Messaging] SMS Response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[Messaging] SMS Error:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

const sendWhatsApp = async (phone, message) => {
    try {
        const apiKey = process.env.WHATSAPP_API_KEY;
        const apiUrl = process.env.WHATSAPP_API_URL;

        if (!apiKey || !apiUrl) {
            console.warn('[Messaging] WHATSAPP_API keys not found in .env. Message not sent.');
            return { success: false, message: 'WhatsApp API keys missing' };
        }

        // General structure for WhatsApp Business APIs (Twilio, Interakt, etc.)
        const response = await axios.post(apiUrl, {
            to: phone,
            message: message
            // Add specific provider requirements here
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        console.log('[Messaging] WhatsApp Response:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[Messaging] WhatsApp Error:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSMS, sendWhatsApp };
