import { TestCase } from '@/lib/api';

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
};

export default function TestCaseCard({ testCase }: { testCase: TestCase }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{testCase.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[testCase.status]}`}
        >
          {testCase.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{testCase.description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Assignee: {testCase.assignee}</span>
        <span className={`px-2 py-1 rounded text-xs ${priorityColors[testCase.priority]}`}>
          {testCase.priority}
        </span>
      </div>
    </div>
  );
}
