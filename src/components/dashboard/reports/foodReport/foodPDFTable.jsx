import React from 'react';
import '../../timeCard/timeCardPDF/timeCardPDF.css';

const FoodPDFTable = ({ data = [], companyInfo = {}, startDate = '', endDate = '' }) => {
    const rows = (data || []).filter(item => !item?.isTotalRow);
    const totalFoodAmount = rows.reduce((sum, item) => sum + (Number(item.totalFoodAmount) || 0), 0);

    // Shared page header matching detailedPDFTable.jsx exactly
    const pageHeader = (reportTitle) => (
        <div className="flex items-start justify-between gap-4">
            {/* Middle: Company Info */}
            <div className="flex-1">
                <div className="text-lg font-bold text-gray-900">{companyInfo?.companyName || ''}</div>
            </div>

            {/* Right: Report Title + Period */}
            <div className="text-right">
                <div className="text-xl font-extrabold tracking-wide text-gray-900 mb-2">
                    {reportTitle}
                </div>
                <div className="text-sm text-gray-700">
                    <span className="font-semibold">Period:</span> {startDate} To {endDate}
                </div>
            </div>
        </div>
    );

    // Chunk rows for pagination so pages don't overflow A4
    const ROWS_PER_PAGE = 22;
    const pageChunks = [];
    if (rows.length === 0) {
        pageChunks.push([]);
    } else {
        for (let i = 0; i < rows.length; i += ROWS_PER_PAGE) {
            pageChunks.push(rows.slice(i, i + ROWS_PER_PAGE));
        }
    }

    return (
        <div className="overflow-x-auto h-full">
            <div id="food-table-container">
                {pageChunks.map((chunk, pageIndex) => {
                    const isLastPage = pageIndex === pageChunks.length - 1;
                    const startingIndex = pageIndex * ROWS_PER_PAGE;

                    return (
                        <div key={pageIndex} className="pdf-page bg-white border border-black p-4 rounded-md">
                            {/* Header */}
                            {pageHeader('Food Report')}

                            {/* Divider */}
                            <div className="border-t border-black mt-2 mb-3" />

                            {/* Table */}
                            <table className="min-w-full border-collapse border border-black pdf-table">
                                <colgroup>
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '58%' }} />
                                    <col style={{ width: '30%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th className="border border-black py-2 px-2 text-sm bg-gray-200" style={{ textAlign: 'center' }}>#</th>
                                        <th className="border border-black py-2 px-3 text-sm bg-gray-200" style={{ textAlign: 'left', paddingLeft: '12px' }}>Employee Name</th>
                                        <th className="border border-black py-2 px-3 text-sm bg-gray-200" style={{ textAlign: 'right', paddingRight: '12px' }}>Total Food Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chunk.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="border border-black text-center py-4 text-gray-500" style={{ textAlign: 'center' }}>
                                                No food records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        chunk.map((item, index) => (
                                            <tr key={item.employeeId || index} className="border border-black">
                                                <td className="border border-black text-sm py-2 px-2" style={{ textAlign: 'center' }}>
                                                    {startingIndex + index + 1}
                                                </td>
                                                <td className="border border-black text-sm py-2 px-3 font-medium text-gray-800" style={{ textAlign: 'left', paddingLeft: '12px' }}>
                                                    {item.employeeName || 'N/A'}
                                                </td>
                                                <td className="border border-black text-sm py-2 px-3 font-semibold text-gray-900" style={{ textAlign: 'right', paddingRight: '12px' }}>
                                                    ₹{Number(item.totalFoodAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}

                                    {/* Totals row on the last page */}
                                    {isLastPage && rows.length > 0 && (
                                        <tr className="border border-black bg-gray-100 font-bold">
                                            <td className="border border-black text-sm py-2 px-2" style={{ textAlign: 'center' }}></td>
                                            <td className="border border-black text-sm py-2 px-3 font-bold" style={{ textAlign: 'left', paddingLeft: '12px' }}>
                                                Total:
                                            </td>
                                            <td className="border border-black text-sm py-2 px-3 font-bold text-gray-900" style={{ textAlign: 'right', paddingRight: '12px' }}>
                                                ₹{totalFoodAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FoodPDFTable;
