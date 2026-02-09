const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TestCase {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export async function fetchTestCases(): Promise<TestCase[]> {
  const res = await fetch(`${API_BASE_URL}/api/test-cases`);
  if (!res.ok) throw new Error('Failed to fetch test cases');
  const data = await res.json();
  return data.data;
}

export async function createTestCase(testCase: Partial<TestCase>): Promise<TestCase> {
  const res = await fetch(`${API_BASE_URL}/api/test-cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testCase),
  });
  if (!res.ok) throw new Error('Failed to create test case');
  const data = await res.json();
  return data.data;
}
