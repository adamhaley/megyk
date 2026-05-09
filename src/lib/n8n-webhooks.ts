const N8N_WEBHOOK_HEADER_NAME = 'N8N_WEBHOOK_TOKEN'

export function getN8nWebhookConfig(endpoint: string) {
  const baseUrl = process.env.N8N_BASE_URL
  const token = process.env.N8N_WEBHOOK_TOKEN

  if (!baseUrl || !token) {
    throw new Error('n8n webhook environment variables are not configured')
  }

  return {
    url: `${baseUrl}/webhook/${endpoint}`,
    // n8n Header Auth expects this exact incoming header name.
    headers: {
      [N8N_WEBHOOK_HEADER_NAME]: token,
    },
  }
}
