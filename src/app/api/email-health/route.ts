import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';

export const dynamic = 'force-dynamic';

const SENDING_DOMAINS = ['deutsches-edelsteinhaus.co', 'deutsches-edelsteinhaus.cc'];

interface DomainHealth {
  domain: string;
  spf: { exists: boolean; record?: string };
  dmarc: { exists: boolean; record?: string };
  mx: { exists: boolean; count: number };
  status: 'healthy' | 'warning' | 'error';
}

async function checkSPF(domain: string): Promise<{ exists: boolean; record?: string }> {
  try {
    const records = await dns.resolveTxt(domain);
    const spfRecord = records.flat().find(r => r.startsWith('v=spf1'));
    return { exists: !!spfRecord, record: spfRecord };
  } catch {
    return { exists: false };
  }
}

async function checkDMARC(domain: string): Promise<{ exists: boolean; record?: string }> {
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = records.flat().find(r => r.startsWith('v=DMARC1'));
    return { exists: !!dmarcRecord, record: dmarcRecord };
  } catch {
    return { exists: false };
  }
}

async function checkMX(domain: string): Promise<{ exists: boolean; count: number }> {
  try {
    const records = await dns.resolveMx(domain);
    return { exists: records.length > 0, count: records.length };
  } catch {
    return { exists: false, count: 0 };
  }
}

async function checkDomainHealth(domain: string): Promise<DomainHealth> {
  const [spf, dmarc, mx] = await Promise.all([
    checkSPF(domain),
    checkDMARC(domain),
    checkMX(domain),
  ]);

  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  
  if (!spf.exists || !mx.exists) {
    status = 'error';
  } else if (!dmarc.exists) {
    status = 'warning';
  }

  return { domain, spf, dmarc, mx, status };
}

export async function GET() {
  try {
    // Check both sending domains
    const healthChecks = await Promise.all(
      SENDING_DOMAINS.map(domain => checkDomainHealth(domain))
    );

    // Get warm-up workflow status (if you have one)
    // const warmupWorkflowId = process.env.WARMUP_WORKFLOW_ID;
    // TODO: Fetch warm-up workflow status similar to verification

    return NextResponse.json({ 
      domains: healthChecks,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('Failed to check email health:', error);
    return NextResponse.json(
      { error: 'Failed to check email health' },
      { status: 500 }
    );
  }
}

