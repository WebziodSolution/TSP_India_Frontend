import { handleFormateUTCDateToLocalDate } from '../../../../service/common/commonService';
import './timeCardPDF.css'

const DetailedPDFTable = ({ companyInfo, data, startDate, endDate, selectedTab, isDetail = true }) => {
    // ── helpers shared by both modes ──────────────────────────────────────────
    const parseDDMMYYYYTime = (s) => {
        if (!s) return null;
        if (s instanceof Date) return s;
        if (typeof s !== "string") return null;
        if (s.includes(",")) {
            const [datePart, timePartRaw] = s.split(",").map(t => t.trim());
            if (datePart && timePartRaw) {
                const [dd, mm, yyyy] = datePart.split("/").map(Number);
                const [timePart, ampm] = timePartRaw.split(" ");
                if (timePart) {
                    let [hh, min, ss] = timePart.split(":").map(Number);
                    if (ampm === "PM" && hh < 12) hh += 12;
                    if (ampm === "AM" && hh === 12) hh = 0;
                    return new Date(yyyy, mm - 1, dd, hh || 0, min || 0, ss || 0);
                }
            }
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    };

    const formatDateTime = (s) => {
        const d = parseDDMMYYYYTime(s);
        if (!d || isNaN(d.getTime())) return null;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const dateStr = `${day}/${month}/${year}`;

        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const timeStr = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

        return { dateStr, timeStr };
    };

    const parseDDMMYYYY = (s) => {
        if (!s || typeof s !== "string") return null;
        const [dd, mm, yyyy] = s.split("/").map((v) => parseInt(v, 10));
        if (!dd || !mm || !yyyy) return null;
        return new Date(yyyy, mm - 1, dd);
    };

    const getProcessedEntries = (entries, isDetail) => {
        if (isDetail) {
            return entries;
        }

        const groups = {};
        entries.forEach(row => {
            if (!row.createdOn) return;
            const datePart = row.createdOn.split(',')[0].trim();
            if (!groups[datePart]) {
                groups[datePart] = [];
            }
            groups[datePart].push(row);
        });

        const consolidated = [];
        Object.keys(groups).forEach(datePart => {
            const dayRows = groups[datePart];
            if (dayRows.length === 1) {
                consolidated.push(dayRows[0]);
                return;
            }

            const sortedRows = [...dayRows].sort((a, b) => {
                if (!a.timeIn) return 1;
                if (!b.timeIn) return -1;
                return a.timeIn.localeCompare(b.timeIn);
            });

            const baseRow = { ...sortedRows[0] };
            const firstWithCalculations = dayRows.find(r => r.totalHours !== "") || baseRow;

            baseRow.regular = firstWithCalculations.regular;
            baseRow.totalHours = firstWithCalculations.totalHours;
            baseRow.breakTime = firstWithCalculations.breakTime;
            baseRow.overtime = firstWithCalculations.overtime;
            baseRow.workHours = firstWithCalculations.workHours;
            baseRow.status = firstWithCalculations.status;
            baseRow.todaySalary = firstWithCalculations.todaySalary;
            baseRow.foodCharge = firstWithCalculations.foodCharge;
            baseRow.netSalary = firstWithCalculations.netSalary;

            let earliestTimeIn = null;
            let earliestTimeInStr = null;
            let latestTimeOut = null;
            let latestTimeOutStr = null;

            dayRows.forEach(row => {
                if (row.timeIn) {
                    const parsedIn = parseDDMMYYYYTime(row.timeIn);
                    if (parsedIn && (!earliestTimeIn || parsedIn < earliestTimeIn)) {
                        earliestTimeIn = parsedIn;
                        earliestTimeInStr = row.timeIn;
                    }
                }
                if (row.timeOut) {
                    const parsedOut = parseDDMMYYYYTime(row.timeOut);
                    if (parsedOut && (!latestTimeOut || parsedOut > latestTimeOut)) {
                        latestTimeOut = parsedOut;
                        latestTimeOutStr = row.timeOut;
                    }
                }
            });

            if (earliestTimeInStr) baseRow.timeIn = earliestTimeInStr;
            if (latestTimeOutStr) baseRow.timeOut = latestTimeOutStr;

            consolidated.push(baseRow);
        });

        consolidated.sort((a, b) => {
            const dateA = parseDDMMYYYY(a.createdOn?.split(',')[0].trim());
            const dateB = parseDDMMYYYY(b.createdOn?.split(',')[0].trim());
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA - dateB;
        });

        return consolidated;
    };

    // ── Shared page header (logo / company / period / report title) ────────────
    const pageHeader = (reportTitle) => (
        <div className="flex items-start justify-between gap-4">
            {/* Middle: Company Info */}
            <div className="flex-1">
                <div className="text-lg font-bold text-gray-900">{companyInfo?.companyName}</div>
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

    const getStatusColor = (status) => {
        if (status === 'P') return '#15803d';
        if (status === 'A') return '#b91c1c';
        if (status === 'W') return '#2563eb';
        if (status === 'H') return '#c2410c';
        if (status === 'PW') return '#4338ca';
        return '#374151';
    };

    // helper: sum "H hr M min" strings from summary rows
    const sumTimeField = (entries, field) => {
        let totalMinutes = 0;
        entries.forEach(row => {
            if (row?.status === 'H' || row?.status === 'W') return;
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
        return `${hrs} hr ${mins} min`;
    };

    const sumNumericField = (entries, field) => {
        let total = 0;
        entries.forEach(row => {
            const val = parseFloat(row[field]);
            if (!isNaN(val)) {
                total += val;
            }
        });
        return Math.round(total);
    };

    // ── Salary Footer (Allowances, Deductions, OT Amount, Net Salary) ────────
    const renderSalaryFooter = (user, entries) => {
        const allowances = Array.isArray(user?.allowances) ? user.allowances : [];
        const deductions = Array.isArray(user?.deductions) ? user.deductions : [];

        const totalAllowances = allowances.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);
        const totalDeductions = deductions.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);

        let otAmount = 0;
        if (user?.totalOtAmount != null && !isNaN(Number(user.totalOtAmount))) {
            otAmount = Number(user.totalOtAmount);
        } else if (user?.otAmount != null && !isNaN(Number(user.otAmount))) {
            otAmount = Number(user.otAmount);
        } else if (entries && entries.length > 0) {
            otAmount = sumNumericField(entries, 'otAmount');
        }

        const baseDaySalary = sumNumericField(entries || [], 'todaySalary');
        const baseFoodCharge = sumNumericField(entries || [], 'foodCharge');
        const baseNetSalary = baseDaySalary - baseFoodCharge;
        const finalNetSalary = Math.round(baseNetSalary + otAmount + totalAllowances - totalDeductions);

        const otHours = user?.totalOvertime || sumTimeField(entries || [], 'overtime');
        const hasOtHours = otHours && otHours !== "00:00" && otHours !== "0 hr 0 min" && otHours !== "0:00";

        return (
            <div className="pdf-footer-section">
                <div className="pdf-footer-cards-container">
                    {/* 1. Allowances */}
                    <div className="pdf-footer-card">
                        <div>
                            <div className="pdf-footer-card-header">
                                Allowances
                            </div>
                            <table className="pdf-footer-table">
                                <tbody>
                                    {allowances.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="text-center text-gray-500 italic py-2">
                                                No allowances
                                            </td>
                                        </tr>
                                    ) : (
                                        allowances.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                <td className="text-left text-gray-700 capitalize">
                                                    {item.label || item.name || 'Allowance'}
                                                </td>
                                                <td className="text-right font-semibold text-gray-900">
                                                    ₹{Number(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="pdf-footer-card-bottom">
                            <span>Total Allowance:</span>
                            <span>₹{totalAllowances.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* 2. Deductions */}
                    <div className="pdf-footer-card">
                        <div>
                            <div className="pdf-footer-card-header">
                                Deductions
                            </div>
                            <table className="pdf-footer-table">
                                <tbody>
                                    {deductions.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="text-center text-gray-500 italic py-2">
                                                No deductions
                                            </td>
                                        </tr>
                                    ) : (
                                        deductions.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                <td className="text-left text-gray-700 capitalize">
                                                    {item.label || item.name || 'Deduction'}
                                                </td>
                                                <td className="text-right font-semibold text-gray-900">
                                                    ₹{Number(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="pdf-footer-card-bottom">
                            <span>Total Deduction:</span>
                            <span>₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* 3. Net Salary Calculation */}
                    <div className="pdf-footer-card">
                        <div>
                            <div className="pdf-footer-card-header">
                                Salary Calculation
                            </div>
                            <table className="pdf-footer-table">
                                <tbody>
                                    <tr>
                                        <td className="text-left text-gray-700">Base Net Salary</td>
                                        <td className="text-right font-semibold text-gray-900">
                                            ₹{baseNetSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-left text-gray-700">
                                            OT Amount
                                        </td>
                                        <td className="text-right font-semibold text-gray-700">
                                            + ₹{otAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-left text-gray-700">Total Allowances</td>
                                        <td className="text-right font-semibold text-gray-700">
                                            + ₹{totalAllowances.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-left text-gray-700">Total Deductions</td>
                                        <td className="text-right font-semibold text-gray-700">
                                            - ₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="pdf-footer-card-bottom">
                            <span className="font-bold text-gray-900">Net Salary:</span>
                            <span className="text-sm font-extrabold text-gray-900">
                                ₹{finalNetSalary.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── TAB 0 – User Summary ──────────────────────────────────────────────────
    if (selectedTab === 0) {
        return (
            <div className="overflow-x-auto h-full">
                <div id="table-container" className="p-3">
                    {data?.map((user, userIdx) => {
                        const entries = getProcessedEntries(user.data || [], isDetail);
                        return (
                            <div key={user.id || userIdx} className="pdf-page bg-white border border-black p-4 rounded-md">
                                {/* Header */}
                                {pageHeader('Monthly Report')}

                                {/* Divider */}
                                <div className="border-t border-black mt-2 mb-2" />

                                {/* Employee name / Stats */}
                                <div className="text-center mb-3">
                                    <h3 className="text-base font-bold text-black capitalize m-0 p-0 leading-tight">
                                        {user?.username || user?.userName}{user?.department ? ` - ${user.department}` : ''}
                                    </h3>
                                    <div className="text-xs font-medium text-gray-800 flex justify-center items-center flex-wrap gap-x-5 gap-y-1 mt-1.5">
                                        <span>Present: <span className="font-bold">{user?.presentCount || '0'}</span></span>
                                        <span>Absent: <span className="font-bold">{user?.absentCount || '0'}</span></span>
                                        <span>Weekly-Off: <span className="font-bold">{user?.weeklyOffCount || '0'}</span></span>
                                        <span>Holiday: <span className="font-bold">{user?.holidayCount || '0'}</span></span>
                                        {(() => {
                                            const hourly = user?.hourlyRate ?? user?.hourRate ?? user?.data?.find(r => r?.hourlyRate != null && Number(r?.hourlyRate) > 0)?.hourlyRate;
                                            if (hourly != null && Number(hourly) > 0) {
                                                return <span>Hourly Rate: <span className="font-bold">₹{Number(hourly).toLocaleString('en-IN')}</span></span>;
                                            }
                                            const daySal = user?.daySalary ?? user?.data?.find(r => r?.todaySalary != null && Number(r?.todaySalary) > 0)?.todaySalary;
                                            if (daySal != null && Number(daySal) > 0) {
                                                return <span>Day Salary: <span className="font-bold">₹{Number(daySal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>;
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="min-w-full border-collapse border border-black pdf-table">
                                    <colgroup>
                                        <col style={{ width: '14%' }} />
                                        <col style={{ width: '13%' }} />
                                        <col style={{ width: '13%' }} />
                                        <col style={{ width: '12%' }} />
                                        <col style={{ width: '13%' }} />
                                        <col style={{ width: '12%' }} />
                                        <col style={{ width: '13%' }} />
                                        <col style={{ width: '10%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            {['Day', 'Clock In', 'Clock Out', 'Work Hours', 'Day Salary', 'Food Charge', 'Net Salary', 'Status'].map(col => (
                                                <th key={col} className="border border-black py-2 px-2 text-center text-sm bg-gray-300 h-5">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-4 text-gray-500">No attendance records found.</td>
                                            </tr>
                                        ) : (
                                            <>
                                                {entries.map((row, i) => {
                                                    const isOff = row?.status === 'H' || row?.status === 'W';
                                                    const formattedTimeIn = formatDateTime(row?.timeIn);
                                                    const formattedTimeOut = formatDateTime(row?.timeOut);
                                                    const isSecondary = row?.totalHours === "";
                                                    const day = isSecondary ? "" : handleFormateUTCDateToLocalDate(row.createdOn);

                                                    const todaySal = row.todaySalary !== "" && row.todaySalary !== null && row.todaySalary !== undefined ? `₹${Number(row.todaySalary).toLocaleString('en-IN')}` : '-';
                                                    const foodChg = row.foodCharge !== "" && row.foodCharge !== null && row.foodCharge !== undefined ? `₹${Number(row.foodCharge).toLocaleString('en-IN')}` : '-';
                                                    const netSal = row.netSalary !== "" && row.netSalary !== null && row.netSalary !== undefined ? `₹${Number(row.netSalary).toLocaleString('en-IN')}` : '-';

                                                    return (
                                                        <tr key={i} className="border border-black">
                                                            <td className="border border-black text-center text-sm">{day}</td>
                                                            <td className="border border-black text-center text-sm">
                                                                {isSecondary ? "" : (isOff ? '-' : (formattedTimeIn ? (
                                                                    <div className="pdf-time-cell">
                                                                        <div className="pdf-date-line">{formattedTimeIn.dateStr}</div>
                                                                        <div className="pdf-time-line">{formattedTimeIn.timeStr}</div>
                                                                    </div>
                                                                ) : '-'))}
                                                            </td>
                                                            <td className="border border-black text-center text-sm">
                                                                {isSecondary ? "" : (isOff ? '-' : (formattedTimeOut ? (
                                                                    <div className="pdf-time-cell">
                                                                        <div className="pdf-date-line">{formattedTimeOut.dateStr}</div>
                                                                        <div className="pdf-time-line">{formattedTimeOut.timeStr}</div>
                                                                    </div>
                                                                ) : '-'))}
                                                            </td>
                                                            <td className="border border-black text-center text-sm">{isSecondary ? "" : (isOff ? '-' : (row.workHours || '-'))}</td>
                                                            <td className="border border-black text-center text-sm">{isSecondary ? "" : (isOff && row.todaySalary == null ? '-' : todaySal)}</td>
                                                            <td className="border border-black text-center text-sm">{isSecondary ? "" : (isOff && row.foodCharge == null ? '-' : foodChg)}</td>
                                                            <td className="border border-black text-center text-sm">{isSecondary ? "" : (isOff && row.netSalary == null ? '-' : netSal)}</td>
                                                            <td className="border border-black text-center text-sm">
                                                                {isSecondary ? "" : (
                                                                    <span style={{ color: getStatusColor(row.status), fontWeight: 'bold' }}>
                                                                        {row.status || '-'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* Totals row */}
                                                <tr className="border border-black bg-gray-100 font-bold">
                                                    <td className="border border-black text-center text-sm">Total</td>
                                                    <td className="border border-black text-center text-sm">-</td>
                                                    <td className="border border-black text-center text-sm">-</td>
                                                    <td className="border border-black text-center text-sm">{sumTimeField(entries, 'workHours')}</td>
                                                    <td className="border border-black text-center text-sm">₹{sumNumericField(entries, 'todaySalary').toLocaleString('en-IN')}</td>
                                                    <td className="border border-black text-center text-sm">₹{sumNumericField(entries, 'foodCharge').toLocaleString('en-IN')}</td>
                                                    <td className="border border-black text-center text-sm">₹{(sumNumericField(entries, 'todaySalary') - sumNumericField(entries, 'foodCharge')).toLocaleString('en-IN')}</td>
                                                    <td className="border border-black text-center text-sm">-</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>

                                {/* Footer after table end for each user */}
                                {renderSalaryFooter(user, entries)}
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
        const {
            userId,
            userName,
            firstName,
            lastName,
            timeIn,
            timeOut,
            companyShiftDto,
            createdOn,
            hourlyRate,
            regular,
            totalHours,
            breakTime,
            overtime,
            workHours,
            status,
            todaySalary,
            foodCharge,
            netSalary,
            allowances,
            deductions,
            otAmount,
            totalOtAmount,
            department,
            totalOvertime
        } = entry;

        const rate = parseFloat(hourlyRate) || 0;
        if (!map.has(userId)) {
            map.set(userId, {
                userId,
                userName,
                firstName,
                lastName,
                department,
                totalOvertime,
                hourlyRate: rate,
                allowances: allowances || [],
                deductions: deductions || [],
                totalOtAmount: totalOtAmount != null ? totalOtAmount : null,
                otAmount: otAmount != null ? otAmount : 0,
                records: []
            });
        }
        const userObj = map.get(userId);
        if ((!userObj.allowances || userObj.allowances.length === 0) && allowances && allowances.length > 0) {
            userObj.allowances = allowances;
        }
        if ((!userObj.deductions || userObj.deductions.length === 0) && deductions && deductions.length > 0) {
            userObj.deductions = deductions;
        }
        if (totalOtAmount != null && userObj.totalOtAmount == null) {
            userObj.totalOtAmount = totalOtAmount;
        }
        if (totalOvertime && !userObj.totalOvertime) {
            userObj.totalOvertime = totalOvertime;
        }
        userObj.records.push({
            timeIn,
            timeOut,
            createdOn,
            companyShiftDto,
            hourlyRate: rate,
            regular,
            totalHours,
            breakTime,
            overtime,
            workHours,
            status,
            todaySalary,
            foodCharge,
            netSalary,
            otAmount
        });
    });
    const result = Array.from(map.values());

    const detailedHeader = () => (
        <thead>
            <tr>
                {['Employee Name', 'Day', 'Clock In', 'Clock Out', 'Work Hours', 'Day Salary', 'Food Charge', 'Net Salary', 'Status'].map(col => (
                    <th key={col} className="border border-black py-2 px-2 text-center text-sm bg-gray-300 h-5">{col}</th>
                ))}
            </tr>
        </thead>
    );

    return (
        <div className="overflow-x-auto h-full">
            <div id="table-container" className="p-3">
                {result?.map((user, userIdx) => {
                    const records = user.records || [];
                    return (
                        <div key={user.userId || userIdx} className="pdf-page bg-white border border-black p-4 rounded-md">
                            {/* Header */}
                            {pageHeader('Monthly Report')}

                            {/* Divider */}
                            <div className="border-t border-black mt-2 mb-2" />

                            {/* Employee name / Stats */}
                            <div className="text-center mb-3">
                                <h3 className="text-base font-bold text-black capitalize m-0 p-0 leading-tight">
                                    {user?.username || user?.userName}{user?.department ? ` - ${user.department}` : ''}
                                </h3>
                                <div className="text-xs font-medium text-gray-800 flex justify-center items-center flex-wrap gap-x-5 gap-y-1 mt-1.5">
                                    <span>Present: <span className="font-bold">{user?.presentCount || '0'}</span></span>
                                    <span>Absent: <span className="font-bold">{user?.absentCount || '0'}</span></span>
                                    <span>Weekly-Off: <span className="font-bold">{user?.weeklyOffCount || '0'}</span></span>
                                    <span>Holiday: <span className="font-bold">{user?.holidayCount || '0'}</span></span>
                                    {(() => {
                                        const hourly = user?.hourlyRate ?? user?.hourRate ?? user?.data?.find(r => r?.hourlyRate != null && Number(r?.hourlyRate) > 0)?.hourlyRate;
                                        if (hourly != null && Number(hourly) > 0) {
                                            return <span>Hourly Rate: <span className="font-bold">₹{Number(hourly).toLocaleString('en-IN')}</span></span>;
                                        }
                                        const daySal = user?.daySalary ?? user?.data?.find(r => r?.todaySalary != null && Number(r?.todaySalary) > 0)?.todaySalary;
                                        if (daySal != null && Number(daySal) > 0) {
                                            return <span>Day Salary: <span className="font-bold">₹{Number(daySal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>;
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                            {/* Detailed table */}
                            <table className="min-w-full border-collapse border border-black pdf-table">
                                <colgroup>
                                    <col style={{ width: '15%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '11%' }} />
                                    <col style={{ width: '8%' }} />
                                </colgroup>
                                {detailedHeader()}
                                <tbody>
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-4 text-gray-500">No attendance records found.</td>
                                        </tr>
                                    ) : (
                                        <>
                                            {records.map((record, i) => {
                                                const isOff = record?.status === 'H' || record?.status === 'W';
                                                const formattedTimeIn = formatDateTime(record?.timeIn);
                                                const formattedTimeOut = formatDateTime(record?.timeOut);
                                                const createdOn = handleFormateUTCDateToLocalDate(record?.createdOn);
                                                const empName = user?.username || user?.userName || '-';

                                                const todaySal = record.todaySalary !== "" && record.todaySalary !== null && record.todaySalary !== undefined ? `₹${Number(record.todaySalary).toLocaleString('en-IN')}` : '-';
                                                const foodChg = record.foodCharge !== "" && record.foodCharge !== null && record.foodCharge !== undefined ? `₹${Number(record.foodCharge).toLocaleString('en-IN')}` : '-';
                                                const netSal = record.netSalary !== "" && record.netSalary !== null && record.netSalary !== undefined ? `₹${Number(record.netSalary).toLocaleString('en-IN')}` : '-';

                                                return (
                                                    <tr key={i} className="border border-black">
                                                        <td className="border border-black text-center text-sm">{empName}</td>
                                                        <td className="border border-black text-center text-sm">{createdOn}</td>
                                                        <td className="border border-black text-center text-sm">
                                                            {isOff ? '-' : (formattedTimeIn ? (
                                                                <div className="pdf-time-cell">
                                                                    <div className="pdf-date-line">{formattedTimeIn.dateStr}</div>
                                                                    <div className="pdf-time-line">{formattedTimeIn.timeStr}</div>
                                                                </div>
                                                            ) : '-')}
                                                        </td>
                                                        <td className="border border-black text-center text-sm">
                                                            {isOff ? '-' : (formattedTimeOut ? (
                                                                <div className="pdf-time-cell">
                                                                    <div className="pdf-date-line">{formattedTimeOut.dateStr}</div>
                                                                    <div className="pdf-time-line">{formattedTimeOut.timeStr}</div>
                                                                </div>
                                                            ) : '-')}
                                                        </td>
                                                        <td className="border border-black text-center text-sm">{isOff ? '-' : (record?.workHours || '-')}</td>
                                                        <td className="border border-black text-center text-sm">{isOff && record?.todaySalary == null ? '-' : todaySal}</td>
                                                        <td className="border border-black text-center text-sm">{isOff && record?.foodCharge == null ? '-' : foodChg}</td>
                                                        <td className="border border-black text-center text-sm">{isOff && record?.netSalary == null ? '-' : netSal}</td>
                                                        <td className="border border-black text-center text-sm">
                                                            <span style={{ color: getStatusColor(record.status), fontWeight: 'bold' }}>
                                                                {record.status || '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Totals row */}
                                            <tr className="border border-black bg-gray-50 font-bold">
                                                <td className="border border-black text-sm text-end pr-5" colSpan={4}>
                                                    Total:
                                                </td>
                                                <td className="border border-black text-center text-sm">
                                                    {sumTimeField(records, 'workHours')}
                                                </td>
                                                <td className="border border-black text-center text-sm">
                                                    ₹{sumNumericField(records, 'todaySalary').toLocaleString('en-IN')}
                                                </td>
                                                <td className="border border-black text-center text-sm">
                                                    ₹{sumNumericField(records, 'foodCharge').toLocaleString('en-IN')}
                                                </td>
                                                <td className="border border-black text-center text-sm">
                                                    ₹{(sumNumericField(records, 'todaySalary') - sumNumericField(records, 'foodCharge')).toLocaleString('en-IN')}
                                                </td>
                                                <td className="border border-black text-center text-sm">
                                                    -
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>

                            {/* Footer after table end for each user */}
                            {renderSalaryFooter(user, records)}
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default DetailedPDFTable;

