'use client';

import { useEffect, useState } from 'react';
import { TestCase, fetchTestCases } from '@/lib/api';
import TestCaseCard from './TestCaseCard';

export default function TestCaseList() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestCases()
      .then(setTestCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error: {error}</p>
        <p className="text-sm mt-2">Make sure the backend server is running on port 3001.</p>
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600">No test cases found.</p>
        <p className="text-sm text-slate-400 mt-2">Create your first test case to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {testCases.map((testCase) => (
        <TestCaseCard key={testCase._id} testCase={testCase} />
      ))}
    </div>
  );
}
