const months = [
    { id: 1, title: 'January', value: 1 },
    { id: 2, title: 'February', value: 2 },
    { id: 3, title: 'March', value: 3 },
    { id: 4, title: 'April', value: 4 },
    { id: 5, title: 'May', value: 5 },
    { id: 6, title: 'June', value: 6 },
    { id: 7, title: 'July', value: 7 },
    { id: 8, title: 'August', value: 8 },
    { id: 9, title: 'September', value: 9 },
    { id: 10, title: 'October', value: 10 },
    { id: 11, title: 'November', value: 11 },
    { id: 12, title: 'December', value: 12 }
];

const SalaryStatementPDFTable = ({
    data = null,
    companyInfo = {},
    filter = [],
    selectedYear = null,
}) => {
    const getFilterTitle = () => {
        if (!filter || filter.length === 0) return "";

        const sorted = [...filter].sort((a, b) => a - b);
        const startMonth = months.find(m => m.value === sorted[0])?.title;
        const endMonth = months.find(m => m.value === sorted[sorted.length - 1])?.title;

        if (sorted.length === 1) {
            return `${startMonth}-${selectedYear}`;
        } else {
            return `${startMonth}-${selectedYear} To ${endMonth}-${selectedYear}`;
        }
    };

    const renderEmployeeRow = (emp, index) => (
        <tr key={`${emp.employeeId}-${emp.month}`}>
            <td className="border border-gray-300 text-center text-sm py-4 px-4 align-middle whitespace-nowrap"> {/* Increased padding */}
                {index + 1}
            </td>
            <td className="border border-gray-300 text-left text-sm py-4 px-4 align-middle font-medium text-gray-800 whitespace-nowrap">{emp.employeeName}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle whitespace-nowrap">{emp.basicSalary ? '₹' + emp.basicSalary?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle whitespace-nowrap">{emp.otAmount ? '₹' + emp.otAmount?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle whitespace-nowrap">{emp.pfAmount ? '₹' + emp.pfAmount?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle whitespace-nowrap">{emp.ptAmount ? '₹' + emp.ptAmount?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle font-semibold whitespace-nowrap">{emp.totalEarnings ? '₹' + emp.totalEarnings?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle font-semibold whitespace-nowrap">{emp.otherDeductions ? '₹' + emp.otherDeductions?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle font-semibold whitespace-nowrap">{emp.totalDeductions ? '₹' + emp.totalDeductions?.toLocaleString('en-IN') : "-"}</td> {/* Increased padding */}
            <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle font-bold whitespace-nowrap">₹{emp.netSalary?.toLocaleString('en-IN')}</td> {/* Increased padding */}
        </tr>
    );

    const renderDepartmentTable = (deptName, employees) => {
        const employeeList = Array.isArray(employees) ? employees : [];

        const totals = {
            earnings: employeeList.reduce((sum, emp) => sum + (emp.totalEarnings || 0), 0),
            otherDeductions: employeeList.reduce((sum, emp) => sum + (emp.otherDeductions || 0), 0),
            deductions: employeeList.reduce((sum, emp) => sum + (emp.totalDeductions || 0), 0),
            netSalary: employeeList.reduce((sum, emp) => sum + (emp.netSalary || 0), 0),
        };

        return (
            <div key={deptName} className="mb-5 border border-gray-400 rounded-md overflow-hidden shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 text-center py-3 bg-gray-100 border-b border-gray-300"> {/* Increased padding */}
                    {deptName}
                </h2>

                <table className="min-w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">#</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-left text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">Name</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">Basic (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">OT (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">PF (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">PT (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">Total Earnings (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">Other Deductions (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">Total Deductions (₹)</th> {/* Increased padding */}
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle whitespace-nowrap">Net Salary (₹)</th> {/* Increased padding */}
                        </tr>
                    </thead>
                    <tbody>
                        {employeeList.map((emp, index) => renderEmployeeRow(emp, index))}

                        {employeeList.length > 0 && (
                            <tr className="font-bold border-t-2 border-gray-400">
                                <td colSpan={6} className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle whitespace-nowrap">Total:</td> {/* Increased padding */}
                                <td className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle text-gray-800 whitespace-nowrap">₹{totals.earnings.toLocaleString('en-IN')}</td> {/* Increased padding */}
                                <td className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle text-gray-800 whitespace-nowrap">₹{totals.otherDeductions.toLocaleString('en-IN')}</td> {/* Increased padding */}
                                <td className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle text-gray-800 whitespace-nowrap">₹{totals.deductions.toLocaleString('en-IN')}</td> {/* Increased padding */}
                                <td className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle text-gray-800 whitespace-nowrap">₹{totals.netSalary.toLocaleString('en-IN')}</td> {/* Increased padding */}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderMonthSection = ({ month, departments }) => {
        return (
            <div key={month} className="last:border-b-0">
                <h2 className="text-xl font-bold text-center mb-6 text-gray-800 uppercase tracking-wide">
                    {month}
                </h2>
                {Object.entries(departments).map(([deptName, employees]) =>
                    renderDepartmentTable(deptName, employees)
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            return <p className="text-center py-12 text-gray-600 text-lg">No salary data available for the selected period.</p>;
        }

        const monthSections = Object.entries(data).map(([month, deptData]) =>
            renderMonthSection({
                month,
                departments: deptData
            })
        );

        return monthSections;
    };


    return (
        <div className="overflow-x-auto h-full bg-white">
            <div id="salary-table-container" style={{ width: '1150px', border: '2px solid black', padding: '16px' }}>

                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-gray-400 pb-6 mb-8">
                    <div className="flex items-center space-x-6">
                        {companyInfo?.companyLogo && (
                            <img
                                src={companyInfo.companyLogo}
                                alt="Company Logo"
                                className="w-28 h-28 object-contain border border-gray-300 p-2 bg-white shadow-sm rounded-md"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{companyInfo?.companyName || 'Your Company Name'}</h2>
                            {companyInfo?.email && <p className="text-sm text-gray-600 mb-0.5"><span className="font-semibold">Email:</span> {companyInfo.email ? companyInfo.email : '-'}</p>}
                            {companyInfo?.phone && <p className="text-sm text-gray-600"><span className="font-semibold">Phone:</span> {companyInfo.phone ? companyInfo.phone : '-'}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold uppercase text-gray-800 tracking-wider mb-2">Salary Statement</h1>
                        <p className="text-md font-medium text-gray-700">Period: <span className="font-semibold text-gray-800">{getFilterTitle()}</span></p>
                    </div>
                </div>

                {/* Main Content: Month and Department Tables */}
                {renderContent()}

            </div>
        </div>
    );
};

export default SalaryStatementPDFTable;