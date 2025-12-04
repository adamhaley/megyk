import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface N8nExecution {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  stoppedAt: string;
}

interface N8nExecutionsResponse {
  data: N8nExecution[];
  nextCursor: string | null;
}

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

export async function GET() {
  try {
    const N8N_URL = process.env.N8N_BASE_URL;
    const WORKFLOW_ID = process.env.VERIFICATION_WORKFLOW_ID;
    const API_KEY = process.env.N8N_API_KEY;

    if (!N8N_URL || !WORKFLOW_ID || !API_KEY) {
      return NextResponse.json(
        { error: 'Missing n8n configuration' },
        { status: 500 }
      );
    }

    // Fetch both workflow status and last execution in parallel
    const [workflowResponse, executionsResponse] = await Promise.all([
      fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
        headers: {
          'X-N8N-API-KEY': API_KEY,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }),
      fetch(`${N8N_URL}/api/v1/executions?workflowId=${WORKFLOW_ID}&status=success&limit=1`, {
        headers: {
          'X-N8N-API-KEY': API_KEY,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })
    ]);

    if (!workflowResponse.ok || !executionsResponse.ok) {
      throw new Error(`n8n API returned error`);
    }

    const workflow: N8nWorkflow = await workflowResponse.json();
    const executions: N8nExecutionsResponse = await executionsResponse.json();

    const lastExecution = executions.data?.[0];
    const lastRunTime = lastExecution?.stoppedAt || null;

    return NextResponse.json({ 
      lastVerification: lastRunTime,
      executionId: lastExecution?.id,
      workflowActive: workflow.active,
      status: 'success'
    });

  } catch (error) {
    console.error('Failed to fetch n8n execution:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch verification status',
        lastVerification: null 
      },
      { status: 500 }
    );
  }
}

