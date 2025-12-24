'use server';

import { InstanceStatus } from '@/lib/uazapi-types';

const UAZAPI_URL = process.env.UAZAPI_URL || 'https://atendimento.uazapi.com';
const UAZAPI_ADMIN_TOKEN = process.env.UAZAPI_ADMIN_TOKEN;

export async function initInstance(instanceName: string) {
  // console.log(`[UAZAPI] Init instance: ${instanceName} at ${UAZAPI_URL}`);
  
  if (!UAZAPI_ADMIN_TOKEN || UAZAPI_ADMIN_TOKEN === 'admin_token_here') {
      console.error('[UAZAPI] Admin token is missing or default.');
      return { error: 'Configuration Error: Admin Token is missing.' };
  }

  // Try both headers just in case, or stick to AdminToken if verified.
  // UazAPI usually expects 'apikey' for global/admin actions in some versions, 'AdminToken' in others.
  // Based on "Ter um admintoken válido", we use AdminToken.
  const headers = {
    'Content-Type': 'application/json',
    'AdminToken': UAZAPI_ADMIN_TOKEN,
    'apikey': UAZAPI_ADMIN_TOKEN // Adding apikey as fallback/duplicate just to be safe
  };

  try {
    const response = await fetch(`${UAZAPI_URL}/instance/init`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: instanceName }),
    });

    const responseText = await response.text();
    // console.log(`[UAZAPI] Init response status: ${response.status}`);
    // console.log(`[UAZAPI] Init response body: ${responseText}`);

    if (!response.ok) {
        return { error: `Failed to init instance: ${response.status} ${responseText}` };
    }

    try {
        const data = JSON.parse(responseText);
        return data;
    } catch (e) {
        return { error: `Invalid JSON response: ${responseText}` };
    }
  } catch (error: any) {
    console.error('Error initializing instance:', error);
    return { error: `Connection failed: ${error.message}` };
  }
}

export async function connectInstance(instanceName: string, token: string, phoneNumber?: string) {
  // console.log(`[UAZAPI] Connect instance: ${instanceName}, Phone: ${phoneNumber || 'QR Code'}`);
  try {
    const body: any = {};
    if (phoneNumber) {
      body.phone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    }

    // Docs: POST /instance/connect
    const response = await fetch(`${UAZAPI_URL}/instance/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token, // Use instance token
        'Authorization': `Bearer ${token}` // Some versions might use Bearer
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    // console.log(`[UAZAPI] Connect response status: ${response.status}`);
    // console.log(`[UAZAPI] Connect response body: ${responseText}`);

    if (!response.ok) {
         throw new Error(`Failed to connect instance: ${response.status} ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (error: any) {
    console.error('Error connecting instance:', error);
    return { error: error.message || 'Failed to connect instance' };
  }
}

export async function getInstanceStatus(instanceName: string, token: string): Promise<InstanceStatus | { error: string }> {
  // console.log(`[UAZAPI] Get status: ${instanceName}`); // Commented out to reduce noise in polling
  try {
    // Docs: GET /instance/status
    const response = await fetch(`${UAZAPI_URL}/instance/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Token': token,
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
        if (response.status === 404) {
            return { error: 'Instance not found' };
        }
        const text = await response.text();
        throw new Error(`Failed to get status: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting instance status:', error);
    return { error: 'Failed to get status' };
  }
}

export async function disconnectInstance(instanceName: string, token: string) {
    try {
        // First disconnect
        const disconnectResponse = await fetch(`${UAZAPI_URL}/instance/disconnect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': token,
            },
        });

        // Even if disconnect fails (e.g. already disconnected), we try to delete
        if (!disconnectResponse.ok) {
             console.warn(`Disconnect failed or already disconnected: ${disconnectResponse.status}`);
        }
        
        // Then delete
        // Docs: DELETE /instance/delete/{instanceName} usually, but let's check standard UAZAPI
        // If UAZAPI follows evolution, it might be DELETE /instance/delete with body or param.
        // Assuming DELETE /instance/delete/{instanceName} or similar.
        // Based on other endpoints, it might be POST /instance/delete or DELETE /instance/{instanceName}
        // Common UAZAPI: DELETE /instance/delete/:instance
        
        const deleteResponse = await fetch(`${UAZAPI_URL}/instance/delete/${instanceName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'AdminToken': UAZAPI_ADMIN_TOKEN!, 
                // Some versions need AdminToken to delete, others might accept instance token if allowed
            },
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            throw new Error(`Failed to delete instance: ${deleteResponse.status} ${errorText}`);
        }

        return await deleteResponse.json();
    } catch (error: any) {
        console.error('Error disconnecting/deleting:', error);
        return { error: error.message || 'Failed to disconnect and delete' };
    }
}

export async function setWebhook(instanceName: string, token: string, webhookUrl: string) {
    try {
        const response = await fetch(`${UAZAPI_URL}/webhook/set/${instanceName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': token,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                webhookUrl: webhookUrl,
                webhookByEvents: true,
                events: [
                    "APPLICATION_STARTUP",
                    "QRCODE_UPDATED",
                    "MESSAGES_SET",
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "MESSAGES_DELETE",
                    "SEND_MESSAGE",
                    "CONTACTS_SET",
                    "CONTACTS_UPSERT",
                    "CONTACTS_UPDATE",
                    "PRESENCE_UPDATE",
                    "CHATS_SET",
                    "CHATS_UPSERT",
                    "CHATS_UPDATE",
                    "CHATS_DELETE",
                    "GROUPS_UPSERT",
                    "GROUP_UPDATE",
                    "GROUP_PARTICIPANTS_UPDATE",
                    "CONNECTION_UPDATE",
                    "CALL"
                ]
            }),
        });

        const responseText = await response.text();
        
        if (!response.ok) {
             console.error(`Failed to set webhook: ${response.status} ${responseText}`);
             return { error: `Failed to set webhook: ${responseText}` };
        }

        return JSON.parse(responseText);
    } catch (error: any) {
        console.error('Error setting webhook:', error);
        return { error: error.message || 'Failed to set webhook' };
    }
}
