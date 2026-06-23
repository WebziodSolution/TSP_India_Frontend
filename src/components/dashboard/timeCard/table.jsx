import { useTheme } from "@mui/material";
import { handleConvertUTCDateToLocalDate } from "../../../service/common/commonService";


const RepoTable = ({ data, startDay = null, endDay = null, tableRef }) => {
    const theme = useTheme();

    const getMonthsBetween = (start, end) => {
        let months = [];
        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        let last = new Date(end.getFullYear(), end.getMonth(), 1);

        while (current <= last) {
            months.push({
                month: current.getMonth() + 1,
                year: current.getFullYear(),
                name: current.toLocaleString('default', { month: 'long' }),
                daysInMonth: new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate(),
                firstDayOfMonth: new Date(current.getFullYear(), current.getMonth(), 1),
                lastDayOfMonth: new Date(current.getFullYear(), current.getMonth() + 1, 0),
            });
            current.setMonth(current.getMonth() + 1);
        }
        return months;
    };

    let startDate, endDate;
    // let currentYear; // To store the year

    if (!startDay || !endDay) {
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        // currentYear = today.getFullYear(); // Default to current year
    } else {
        startDate = new Date(startDay);
        endDate = new Date(endDay);
        // endDate = new Date(new Date(endDay).getFullYear(), new Date(endDay).getMonth() + 1, 0);
        // currentYear = startDate.getFullYear(); // Infer year from startDate
    }

    const months = getMonthsBetween(startDate, endDate);

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className="overflow-x-auto h-full" ref={tableRef}>
            <div id="table-container">
                {months.map((month, monthIndex) => {
                    let startDayOfMonth = 1;
                    let endDayOfMonth = month.daysInMonth;

                    if (month.month === startDate.getMonth() + 1 && month.year === startDate.getFullYear()) {
                        startDayOfMonth = startDate.getDate();
                    }

                    if (month.month === endDate.getMonth() + 1 && month.year === endDate.getFullYear()) {
                        endDayOfMonth = endDate.getDate();
                    }

                    let daysArray = [];
                    for (let i = startDayOfMonth; i <= endDayOfMonth; i++) {
                        daysArray.push(i);
                    }

                    return data?.length > 0 ? (
                        <table key={monthIndex} className="min-w-full border-collapse border border-gray-300 h-full mb-6">
                            <thead>
                                <tr>
                                    <th style={{ color: theme.palette.primary.text.main }} className="border border-gray-300 px-10 text-sm bg-gray-200 h-10" rowSpan={2}>
                                        User Name
                                    </th>
                                    <th style={{ color: theme.palette.primary.text.main }} className="border border-gray-300 py-2 px-2 text-sm bg-gray-200 h-10" colSpan={daysArray.length + 1}>
                                        {month.name} {month.year}
                                    </th>
                                </tr>
                                <tr>
                                    {daysArray.map((day) => (
                                        <th style={{ color: theme.palette.primary.text.main }} key={day} className="border border-gray-300 px-4 text-sm h-10">
                                            {day}
                                        </th>
                                    ))}
                                    <th style={{ color: theme.palette.primary.text.main }} className="border border-gray-300 font-bold px-8 text-sm">Total Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((user, index) => (
                                    <tr key={index}>
                                        <td style={{ color: theme.palette.primary.text.main }} className="border border-gray-300 px-2 text-center font-bold text-sm">
                                            {user.username}
                                        </td>
                                        {(() => {
                                            let totalMinutes = 0;
                                            return daysArray.map((day) => {
                                                const monthRecords = (user.records || [])
                                                    .filter((r) => r.month === month.month)
                                                    .flatMap((r) => r.data || [])
                                                    .flatMap((d) => d.records || [])
                                                    .filter((rec) => {
                                                        if (!rec.timeIn) return false;

                                                        const convertedDate = new Date(handleConvertUTCDateToLocalDate(rec.timeIn));
                                                        const actualMonth = convertedDate.getMonth() + 1;
                                                        const actualDay = convertedDate.getDate();
                                                        return actualMonth === month.month && actualDay === day;
                                                    });
                                                let cellData = "-";

                                                if (monthRecords.length) {
                                                    cellData = monthRecords.map((record, recIndex) => {
                                                        if (!record.timeIn || !record.timeOut) return null;

                                                        const inTime = new Date(handleConvertUTCDateToLocalDate(record.timeIn));
                                                        const outTime = new Date(handleConvertUTCDateToLocalDate(record.timeOut));

                                                        if (isNaN(inTime) || isNaN(outTime)) return null;

                                                        const diffMins = Math.round((outTime - inTime) / (1000 * 60));
                                                        totalMinutes += diffMins;

                                                        return (
                                                            <div key={recIndex} className={`${monthRecords.length - 1 === recIndex ? '' : 'mb-3'}`}>
                                                                <p  className="text-green-600 font-semibold text-xs">
                                                                    {formatTime(handleConvertUTCDateToLocalDate(record.timeIn))}
                                                                </p>
                                                                <p className="text-red-600 font-semibold text-xs">
                                                                    {formatTime(handleConvertUTCDateToLocalDate(record.timeOut))}
                                                                </p>
                                                            </div>
                                                        );
                                                    });
                                                }

                                                return (
                                                    <td key={`${month.month}-${day}`} className="border border-gray-300 p-2 text-center">
                                                        {cellData}
                                                    </td>
                                                );
                                            }).concat(
                                                <td style={{ color: theme.palette.primary.text.main }} key={`total-${month.month}`} className="border border-gray-300 px-4 font-bold text-xs text-center">
                                                    {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                                                </td>
                                            );
                                        })()}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p key={`no-data-${monthIndex}`} className="flex justify-center items-center font-bold">
                            No records found
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

export default RepoTable;