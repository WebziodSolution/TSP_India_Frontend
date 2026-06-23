import dayjs from "dayjs";


const PFPDFTable = ({ data, companyInfo, period }) => {
    const rows = data?.filter(item => !item?.isTotalRow);

    return (
        <div className="overflow-x-auto h-full">
            <div id="PF-table-container" style={{ width: '1000px', border: '2px solid black', padding: '16px' }}>
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
                        <h1 className="text-3xl font-bold uppercase text-gray-800 tracking-wider mb-2">PF Report</h1>
                        <p className="text-md font-medium text-gray-700">Period:&nbsp;&nbsp;<span className="font-semibold text-gray-800">{period}-{new Date().getFullYear()}</span></p>
                    </div>
                </div>


                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="border border-gray-300 bg-gray-100">
                            <th className="border border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-700 capitalize align-middle">#</th>
                            <th className="border border-gray-300 py-3 px-4 text-left text-sm font-bold text-gray-700 capitalize align-middle">Employee Name</th>
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle">Employee PF</th>
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle">Employer PF</th>
                            <th className="border border-gray-300 py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle">Total PF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows?.map((item, index) => (
                            <tr key={index} className="border border-gray-300">
                                <td className="border border-gray-300 text-center text-sm py-4 px-4 align-middle">{index + 1}</td>
                                <td className="border border-gray-300 text-left text-sm py-4 px-4 align-middle">{item?.userName}</td>
                                <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle">₹{item?.employee_pf_amount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle">₹{item?.employer_pf_amount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                <td className="border border-gray-300 text-right text-sm py-4 px-4 align-middle">₹{item?.total_amount?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                            </tr>
                        ))}
                        <tr className="font-bold border border-gray-300">
                            <td colSpan={4} className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle">
                                <strong className='font-bold mr-5'>Total</strong>
                            </td>
                            <td className="border border-gray-300 py-3 px-4 text-right text-sm capitalize align-middle text-gray-800">
                                <strong className='font-bold'>₹{rows?.reduce((acc, item) => acc + (item?.total_amount || 0), 0)?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PFPDFTable