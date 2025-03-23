const ComparisonSection = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">How We Compare</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500"></th>
              <th className="px-6 py-4 text-center text-sm font-medium text-primary">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 014-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 01-4 4H3" />
                    </svg>
                  </div>
                  <span>PolkaRemit</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-neutral-600">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  <span>Traditional Banks</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-neutral-600">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <span>Money Transfer Services</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-neutral-800">Average Fees</td>
              <td className="px-6 py-4 text-center font-medium text-success">0.5 - 1%</td>
              <td className="px-6 py-4 text-center text-neutral-700">3 - 5%</td>
              <td className="px-6 py-4 text-center text-neutral-700">5 - 10%</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-neutral-800">Settlement Time</td>
              <td className="px-6 py-4 text-center font-medium text-success">Minutes</td>
              <td className="px-6 py-4 text-center text-neutral-700">2-5 Days</td>
              <td className="px-6 py-4 text-center text-neutral-700">Hours to Days</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-neutral-800">Transparency</td>
              <td className="px-6 py-4 text-center font-medium text-success">Full blockchain transparency</td>
              <td className="px-6 py-4 text-center text-neutral-700">Limited</td>
              <td className="px-6 py-4 text-center text-neutral-700">Partial</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-neutral-800">Earn While Transferring</td>
              <td className="px-6 py-4 text-center font-medium text-success">Yes (Liquidity Pools)</td>
              <td className="px-6 py-4 text-center text-neutral-700">No</td>
              <td className="px-6 py-4 text-center text-neutral-700">No</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ComparisonSection;
