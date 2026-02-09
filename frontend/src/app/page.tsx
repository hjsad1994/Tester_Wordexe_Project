import Header from '@/components/Header';
import TestCaseList from '@/components/TestCaseList';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Test Cases</h2>
          <p className="text-slate-600">Manage and view your Playwright test cases</p>
        </div>
        <TestCaseList />
      </main>
    </div>
  );
}
