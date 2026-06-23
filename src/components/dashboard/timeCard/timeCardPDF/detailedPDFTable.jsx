import { handleConvertUTCDateToLocalDate, handleFormateUTCDateToLocalDate } from '../../../../service/common/commonService';
import './timeCardPDF.css'

const renderStatus = (status) => {
    let color = 'inherit';
    let fontWeight = 'normal';
    if (status === 'A') {
        color = '#ff0000';
        fontWeight = 'bold';
    } else if (status === 'W') {
        color = '#19ff13';
        fontWeight = 'bold';
    } else if (status === 'H') {
        color = '#ff8443';
        fontWeight = 'bold';
    } else if (status === 'PW') {
        color = '#0303fc';
        fontWeight = 'bold';
    }
    return <span style={{ color, fontWeight }}>{status || '-'}</span>;
};

const DetailedPDFTable = ({ companyInfo, data, startDate, endDate, selectedTab }) => {
    // ── helpers shared by both modes ──────────────────────────────────────────
    const parseDDMMYYYYTime = (s) => {
        if (!s) return null;
        const [datePart, timePartRaw] = s.split(",").map(t => t.trim());
        if (!datePart || !timePartRaw) return null;
        const [dd, mm, yyyy] = datePart.split("/").map(Number);
        const [timePart, ampm] = timePartRaw.split(" ");
        let [hh, min, ss] = timePart.split(":").map(Number);
        if (ampm === "PM" && hh < 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;
        return new Date(yyyy, mm - 1, dd, hh, min, ss);
    };

    // ── Shared page header (logo / company / period / report title) ────────────
    const pageHeader = (reportTitle) => (
        <div className="flex items-start justify-between gap-4">
            {/* Left: Logo */}
            <div className="w-24 h-20 border border-black rounded-md overflow-hidden flex items-center justify-center">
                {companyInfo?.companyLogo ? (
                    <img src={companyInfo.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : null}
            </div>

            {/* Middle: Company Info */}
            <div className="flex-1">
                <div className="text-xl font-bold text-gray-900">{companyInfo?.companyName}</div>
                {companyInfo?.email && (
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">Email:</span> {companyInfo.email}
                    </div>
                )}
                {companyInfo?.phone && (
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">Phone:</span> {companyInfo.phone}
                    </div>
                )}
            </div>

            {/* Right: Report Title + Period */}
            <div className="text-right">
                <div className="text-2xl font-extrabold tracking-wide text-gray-900 mb-2">
                    {reportTitle}
                </div>
                <div className="text-sm text-gray-700">
                    <span className="font-semibold">Period:</span> {startDate} To {endDate}
                </div>
            </div>
        </div>
    );

    // helper: sum "H hr M min" strings from summary rows
    const sumTimeField = (entries, field) => {
        let totalMinutes = 0;
        entries.forEach(row => {
            const val = row[field];
            if (val && typeof val === 'string' && val.includes(':')) {
                const [h, m] = val.split(':').map(Number);
                totalMinutes += h * 60 + m;
            } else if (val && typeof val === 'string' && val.includes('hr')) {
                // "H hr M min" format
                const hrMatch = val.match(/(\d+)\s*hr/);
                const minMatch = val.match(/(\d+)\s*min/);
                totalMinutes += (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0);
            }
        });
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        // const decimal = (Math.round((totalMinutes / 60) * 100) / 100).toFixed(2);
        return `${hrs} hr ${mins} min`;
    };

    // ── TAB 0 – User Summary ──────────────────────────────────────────────────
    // data = array of { id, username, data: [{ rowId, createdOn, timeIn, timeOut,
    //   regular, overtime, totalHours, workHours, breakTime, status }] }
    if (selectedTab === 0) {

        return (
            <div className="overflow-x-auto h-full">
                <div id="table-container" className="p-3">
                    {data?.map((user, index) => {
                        const entries = user.data || [];
                        return (
                            <div key={user.id || index} className="pdf-page bg-white border border-black p-4 rounded-md">

                                {/* Header */}
                                {pageHeader('USER SUMMARY')}

                                {/* Divider */}
                                <div className="border-t border-black my-4" />

                                {/* Employee name */}
                                {/* <div className="text-center font-bold text-lg text-gray-900 mb-3 capitalize">
                                    {user.username} - {user.department}
                                </div> */}
                                <div className='flex justify-start items-center mb-5'>
                                    <div className='grow'>
                                        <h3 className="text-lg font-semibold text-black capitalize text-start">{user.username} - {user.department}</h3>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-black capitalize text-end">
                                            Present: {user.presentCount || '0'} &nbsp;&nbsp;&nbsp; Absent: {user.absentCount || '0'} &nbsp;&nbsp;&nbsp; Weekly-Off: {user.weeklyOffCount || '0'} &nbsp;&nbsp;&nbsp; Holiday: {user.holidayCount || '0'}
                                        </p>
                                    </div>
                                </div>

                                {/* Summary table – same columns as the UI */}
                                <table className="min-w-full border-collapse border border-black pdf-table">
                                    <thead>
                                        <tr>
                                            {['Day', 'Regular (HR)', 'Time In', 'Time Out', 'Total Hours', 'Break Time', 'OT', 'Work Hours', 'Status'].map(col => (
                                                <th key={col} className="border border-black py-2 px-2 text-center text-sm bg-gray-300 h-5">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((row, i) => {
                                            const timeIn = row?.timeIn ? parseDDMMYYYYTime(row.timeIn) : null;
                                            const timeOut = row?.timeOut ? parseDDMMYYYYTime(row.timeOut) : null;
                                            const day = handleFormateUTCDateToLocalDate(row.createdOn);

                                            return (
                                                <tr key={i} className="border border-black">
                                                    <td className="border border-black text-center text-sm h-10">{day}</td>
                                                    <td className="border border-black text-center text-sm h-10">{row.regular || '-'}</td>
                                                    <td className="border border-black text-center text-sm h-10">
                                                        {timeIn ? timeIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                                    </td>
                                                    <td className="border border-black text-center text-sm h-10">
                                                        {timeOut ? timeOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                                    </td>
                                                    <td className="border border-black text-center text-sm h-10">{row.totalHours || '-'}</td>
                                                    <td className="border border-black text-center text-sm h-10">{row.breakTime || '-'}</td>
                                                    <td className="border border-black text-center text-sm h-10">{row.overtime || '-'}</td>
                                                    <td className="border border-black text-center text-sm h-10">{row.workHours || '-'}</td>
                                                    <td className="border border-black text-center text-sm h-10">{renderStatus(row.status)}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* Totals row */}
                                        {entries.length > 0 && (
                                            <tr className="border border-black bg-gray-100 font-bold">
                                                <td className="border border-black text-center text-sm h-10">Total</td>
                                                <td className="border border-black text-center text-sm h-10">{sumTimeField(entries, 'regular')}</td>
                                                <td className="border border-black text-center text-sm h-10">-</td>
                                                <td className="border border-black text-center text-sm h-10">-</td>
                                                <td className="border border-black text-center text-sm h-10">{sumTimeField(entries, 'totalHours')}</td>
                                                <td className="border border-black text-center text-sm h-10">-</td>
                                                <td className="border border-black text-center text-sm h-10">{sumTimeField(entries, 'overtime')}</td>
                                                <td className="border border-black text-center text-sm h-10">{sumTimeField(entries, 'workHours')}</td>
                                                <td className="border border-black text-center text-sm h-10">-</td>
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
    }

    // ── TAB 1 & 2 – All Entries (Detailed) ───────────────────────────────────
    // data = flat array of individual entries; build per-user groups here
    const map = new Map();
    data?.forEach(entry => {
        const { userId, userName, firstName, lastName, timeIn, timeOut, companyShiftDto, createdOn, hourlyRate, regular, totalHours, breakTime, overtime, workHours, status } = entry;
        const rate = parseFloat(hourlyRate) || 0;
        if (!map.has(userId)) {
            map.set(userId, { userId, userName, firstName, lastName, hourlyRate: rate, records: [] });
        }
        map.get(userId).records.push({ timeIn, timeOut, createdOn, companyShiftDto, hourlyRate: rate, regular, totalHours, breakTime, overtime, workHours, status });
    });
    const result = Array.from(map.values());


    const detailedHeader = () => (
        <thead>
            <tr>
                {['Day', 'Regular(HR)', 'Time In', 'Time Out', 'Total Hours', 'Break Time', 'OT', 'Work Hours', 'Status'].map(col => (
                    <th key={col} className="border border-black py-2 px-2 text-center text-sm bg-gray-300 h-5">{col}</th>
                ))}
            </tr>
        </thead>
    );

    return (
        <div className="overflow-x-auto h-full">
            <div id="table-container" className="p-3">
                {result?.map((user, index) => (
                    <div key={user.userId || index} className="pdf-page bg-white border border-black p-4 rounded-md">

                        {/* Header */}
                        {pageHeader('DETAILED REPORT')}

                        {/* Divider */}
                        <div className="border-t border-black my-4" />

                        {/* Employee name */}
                        <div className="text-center font-bold text-lg text-gray-900 mb-3">
                            {user?.firstName} {user?.lastName}
                        </div>

                        {/* Detailed table */}
                        <table className="min-w-full border-collapse border border-black pdf-table">
                            {detailedHeader()}
                            <tbody>
                                {user?.records?.map((record, i) => {
                                    const timeIn = record?.timeIn ? parseDDMMYYYYTime(record.timeIn) : null;
                                    const timeOut = record?.timeOut ? parseDDMMYYYYTime(record.timeOut) : null;
                                    const createdOn = handleFormateUTCDateToLocalDate(record?.createdOn);

                                    return (
                                        <tr key={i} className="border border-black">
                                            <td className="border border-black text-center text-sm h-10">{createdOn}</td>
                                            <td className="border border-black text-center text-sm h-10">{record?.regular || '-'}</td>
                                            <td className="border border-black text-center text-sm h-10">
                                                {timeIn ? timeIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                            </td>
                                            <td className="border border-black text-center text-sm h-10">
                                                {timeOut ? timeOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                            </td>
                                            <td className="border border-black text-center text-sm h-10">{record?.totalHours || '-'}</td>
                                            <td className="border border-black text-center text-sm h-10">{record?.breakTime || '-'}</td>
                                            <td className="border border-black text-center text-sm h-10">{record?.overtime || '-'}</td>
                                            <td className="border border-black text-center text-sm h-10">{record?.workHours || '-'}</td>
                                            <td className="border border-black text-center text-sm h-10">{renderStatus(record?.status)}</td>
                                        </tr>
                                    );
                                })}

                                {/* Totals row */}
                                <tr className="border border-black bg-gray-50 font-bold">
                                    <td className="border border-black text-sm h-10 text-end pr-5" colSpan={4}>
                                        Total:
                                    </td>
                                    <td className="border border-black text-center text-sm h-10">
                                        {sumTimeField(user?.records, 'totalHours')}
                                    </td>
                                    <td className="border border-black text-center text-sm h-10">
                                        -
                                    </td>
                                    <td className="border border-black text-center text-sm h-10">
                                        {sumTimeField(user?.records, 'overtime')}
                                    </td>
                                    <td className="border border-black text-center text-sm h-10">
                                        {sumTimeField(user?.records, 'workHours')}
                                    </td>
                                    <td className="border border-black text-center text-sm h-10">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DetailedPDFTable
