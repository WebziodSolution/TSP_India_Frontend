const numberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const convertLessThanOneThousand = (n) => {
        let s = '';
        if (n < 20) {
            s = a[n];
        } else {
            s = b[Math.floor(n / 10)] + ' ' + a[n % 10];
        }
        return s;
    };

    if (num === 0) return 'Zero Rupees Only';

    let n = Math.round(num * 100) / 100; // Handle decimals
    let integerPart = Math.floor(n);
    let decimalPart = Math.round((n - integerPart) * 100);

    let output = '';

    // Process crores
    if (integerPart >= 10000000) {
        output += convertLessThanOneThousand(Math.floor(integerPart / 10000000)) + 'crore ';
        integerPart %= 10000000;
    }
    // Process lakhs
    if (integerPart >= 100000) {
        output += convertLessThanOneThousand(Math.floor(integerPart / 100000)) + 'lakh ';
        integerPart %= 100000;
    }
    // Process thousands
    if (integerPart >= 1000) {
        output += convertLessThanOneThousand(Math.floor(integerPart / 1000)) + 'thousand ';
        integerPart %= 1000;
    }
    // Process hundreds
    if (integerPart >= 100) {
        output += convertLessThanOneThousand(Math.floor(integerPart / 100)) + 'hundred ';
        integerPart %= 100;
    }
    // Process remaining
    if (integerPart > 0) {
        output += convertLessThanOneThousand(integerPart);
    }

    output = output.trim();
    output += ' Rupees';

    if (decimalPart > 0) {
        output += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paisa';
    }
    return output + ' Only';
};

const SalarySlip = ({ data, companyInfo }) => {
    return (
        <div className="font-inter antialiased bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen grid grid-cols-1 place-items-center gap-8">
            {
                data?.map((employee, index) => (
                    <div key={index} id={`salary-slip-${index}`} className="salary-slip w-full bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        {/* Top Blue Bar */}
                        {/* <div className="h-2 bg-gradient-to-r from-[#666cff] to-[#9194fb]"></div> */}

                        {/* Header Section */}
                        <div className="p-6 sm:p-8 flex justify-between items-start">
                            <div className="w-40 h-24">
                                <img src={companyInfo?.companyLogo} alt="Logo" className="w-40 h-24 border" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{companyInfo.companyName}</h1>
                                <p className="text-sm text-gray-600">{companyInfo.email}</p>
                                <p className="text-sm text-gray-600">{companyInfo.phone}</p>
                            </div>
                        </div>

                        <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">{employee?.monthYear}</h2>

                            {/* Employee Pay Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-4 text-gray-700">
                                <div className="col-span-3">
                                    <p className="mb-1"><strong className="w-40 inline-block">Employee Name:</strong> {employee.employeeName}</p>
                                    <p className="mb-1"><strong className="w-40 inline-block">Department:</strong> {employee.departmentName}</p>
                                    <p className="mb-1"><strong className="w-40 inline-block">Pay Period:</strong> {employee?.monthYear}</p>
                                </div>
                                <div className="text-right md:text-left md:pl-8 col-span-2">
                                    <p className="text-lg font-semibold text-gray-800 mb-1">Employee Net Pay</p>
                                    <p className="text-3xl font-extrabold mb-2">₹{employee.netSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Earnings Section */}
                        <div className="grid grid-cols-2 gap-3 p-6 sm:p-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">EARNINGS</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left table-auto border-collapse">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-3 border-b border-gray-300">Component</th>
                                                <th className="p-3 border-b border-gray-300 text-right">Amount</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                employee?.basicSalary && (
                                                    <tr className="hover:bg-gray-50">
                                                        <td className="p-3 border-b border-gray-100">Basic Salary</td>
                                                        <td className="p-3 border-b border-gray-100 text-right">₹{employee?.basicSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                                    </tr>
                                                )
                                            }

                                            <tr className="hover:bg-gray-50">
                                                <td className="p-3 border-b border-gray-100">Earn Salary</td>
                                                <td className="p-3 border-b border-gray-100 text-right">₹{employee?.totalEarnSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>

                                            <tr className="hover:bg-gray-50">
                                                <td className="p-3 border-b border-gray-100">Over Time</td>
                                                <td className="p-3 border-b border-gray-100 text-right">₹{employee?.otAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>
                                            {
                                                employee?.allowanceList?.map((row, rowIndex) => (
                                                    <tr className="hover:bg-gray-50" key={rowIndex}>
                                                        <td className="p-3 border-b border-gray-100">{row?.label}</td>
                                                        <td className="p-3 border-b border-gray-100 text-right">₹{row?.amount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                                    </tr>
                                                ))
                                            }
                                            <tr className="font-bold">
                                                <td className="p-3 border-t border-b-2">Gross Earnings</td>
                                                <td className="p-3 border-t border-b-2 text-right">₹{employee?.totalEarnings?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Deductions Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">DEDUCTIONS</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left table-auto border-collapse">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="p-3 border-b border-gray-300">Component</th>
                                                <th className="p-3 border-b border-gray-300 text-right">(-)Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="hover:bg-gray-50">
                                                <td className="p-3 border-b border-gray-100">Professional Tax</td>
                                                <td className="p-3 border-b border-gray-100 text-right">₹{employee?.ptAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="p-3 border-b border-gray-100">Provident Fund</td>
                                                <td className="p-3 border-b border-gray-100 text-right">₹{employee?.pfAmount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="p-3 border-b border-gray-100">Other Deductions</td>
                                                <td className="p-3 border-b border-gray-100 text-right">₹{employee?.otherDeductions?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>
                                            {
                                                employee?.deductionsList?.map((row, rowIndex) => (
                                                    <tr className="hover:bg-gray-50" key={rowIndex}>
                                                        <td className="p-3 border-b border-gray-100">{row?.label}</td>
                                                        <td className="p-3 border-b border-gray-100 text-right">₹{row?.amount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                                    </tr>
                                                ))
                                            }
                                            <tr className="font-bold">
                                                <td className="p-3 border-t border-b-2">Total Deductions</td>
                                                <td className="p-3 border-t border-b-2 text-right">₹{employee?.totalDeductions?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay & Footer */}
                        <div className="p-6 sm:p-8 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-lg font-bold text-gray-800">NET PAY (Gross Earnings - Total Deductions)</p>
                                <p className="text-xl font-bold text-gray-800">₹{employee.netSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</p>
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-md font-bold text-gray-800">Total Net Payable ₹{employee.netSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })} <span className="font-normal italic text-gray-600 capitalize">({numberToWords(employee.netSalary)})</span></p>
                            </div>

                            <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500 flex justify-end">
                                <div className="h-24 flex flex-col justify-end">
                                    <hr className="my-1 h-0.5" />
                                    <p>Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default SalarySlip