import { fileUploadURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// get user timezone dynamically
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const indianOrganizationType = [
    {
        id: 1,
        title: "Sole Proprietorship"
    },
    {
        id: 2,
        title: "Partnership"
    },
    {
        id: 3,
        title: "Limited Liability Partnership"
    },
    {
        id: 4,
        title: "Private Limited Companies"
    },
    {
        id: 5,
        title: "Public Limited Companies"
    },
    {
        id: 6,
        title: "One-Person Companies"
    },
    {
        id: 7,
        title: "Section 8 Company"
    },
    {
        id: 8,
        title: "Joint-Venture Company"
    },
    {
        id: 9,
        title: "Non-Government Organization (NGO)"
    },
    { id: 10, title: "Co-operative Society" },
    { id: 11, title: "Trust" },
    { id: 12, title: "Producer Company" },
    { id: 13, title: "Public Sector Undertaking (PSU)" },
    { id: 14, title: "Hindu Undivided Family (HUF)" },
    { id: 15, title: "Non-Banking Financial Company (NBFC)" },

];

export const oganizationType = [
    { id: 1, title: 'Sole Proprietorship' },
    { id: 2, title: 'Partnership' },
    { id: 3, title: 'Limited Liability Company (LLC)' },
    { id: 4, title: 'Professional Limited Liability Company (PLLC)' },
    { id: 5, title: 'S Corporation' },
    { id: 6, title: 'C Corporation' },
    { id: 7, title: 'Nonprofit', },
    { id: 8, title: 'Government Agency' },
    { id: 9, title: 'Educational Institution' },
    { id: 10, title: 'Franchise' },
];

// uploadFilesChunked.js (or replace inside same file)
export const uploadFiles = async (data) => {
    // data is FormData coming from your existing code
    // expecting: files, folderName, userId
    const file = data.get("files");
    const folderName = data.get("folderName");
    const userId = data.get("userId");

    if (!file) throw new Error("No file found in FormData");

    const api = axiosInterceptor();

    // 1) START
    const startRes = await api.post(`${fileUploadURL}/start`, null, {
        params: {
            folderName,
            userId,
            fileName: file.name,
        },
    });

    const uploadId = startRes?.data?.result?.uploadId || startRes?.data?.data?.uploadId;
    if (!uploadId) throw new Error("uploadId not returned from server");

    // 2) CHUNKS
    const chunkSize = 5 * 1024 * 1024; // 5MB (tune 2MB–10MB)
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);

        const chunkForm = new FormData();
        chunkForm.append("folderName", folderName);
        chunkForm.append("userId", userId);
        chunkForm.append("uploadId", uploadId);
        chunkForm.append("chunkIndex", chunkIndex);
        chunkForm.append("totalChunks", totalChunks);
        chunkForm.append("originalFileName", file.name);
        chunkForm.append("chunk", blob, file.name);

        await api.post(`${fileUploadURL}/chunk`, chunkForm, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    // 3) COMPLETE (returns final URL like your old API)
    const completeRes = await api.post(`${fileUploadURL}/complete`, null, {
        params: {
            folderName,
            userId,
            uploadId,
            totalChunks,
            originalFileName: file.name,
        },
    });

    return completeRes;
};


// export const handleConvertUTCDateToLocalDate = (utcDateString) => {
//     if (!utcDateString) return null;

//     try {
//         // Parse the UTC date string
//         const [datePart, timePart] = utcDateString.split(', ');
//         const [month, day, year] = datePart.split('/');
//         const [time, period] = timePart.split(' ');
//         const [hours, minutes, seconds] = time.split(':');

//         // Convert to 24-hour format
//         let hours24 = parseInt(hours, 10);
//         if (period === 'PM' && hours24 !== 12) hours24 += 12;
//         if (period === 'AM' && hours24 === 12) hours24 = 0;

//         // Create a Date object in UTC and convert to local time
//         return new Date(Date.UTC(
//             parseInt(year, 10),
//             parseInt(month, 10) - 1,
//             parseInt(day, 10),
//             hours24,
//             parseInt(minutes, 10),
//             parseInt(seconds, 10)
//         ));
//     } catch (error) {
//         console.error("Conversion error:", error);
//         return null;
//     }
// };

export const handleConvertUTCDateToLocalDate = (utcDateString) => {
    if (!utcDateString) return null;

    try {
        // "29/01/2026, 05:28:39 PM"  =>  DD/MM/YYYY, hh:mm:ss AM/PM
        const [datePart, timePartRaw] = utcDateString.split(",").map(s => s.trim());
        if (!datePart || !timePartRaw) return null;

        const [dd, mm, yyyy] = datePart.split("/").map(Number);

        const [timePart, ampmRaw] = timePartRaw.split(" ");
        const [hhRaw, minRaw, secRaw] = timePart.split(":").map(Number);

        const ampm = (ampmRaw || "").toUpperCase();
        let hh = hhRaw;

        if (ampm === "PM" && hh < 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;

        // Create UTC time, then JS Date will show it in local timezone automatically
        return new Date(Date.UTC(yyyy, mm - 1, dd, hh, minRaw, secRaw));
    } catch (error) {
        console.error("Conversion error:", error);
        return null;
    }
};

export function handleFormateUTCDateToLocalDate(input) {
    if (!input) return "-";

    let dateObj = null;

    // 1) Dayjs object support
    if (typeof input === "object" && input?.$isDayjsObject) {
        dateObj = input.toDate();
    }
    // 2) Already a Date
    else if (input instanceof Date) {
        dateObj = input;
    }
    // 3) Number timestamp
    else if (typeof input === "number") {
        dateObj = new Date(input);
    }
    // 4) String parsing
    else if (typeof input === "string") {
        const s = input.trim();

        // Handle: "31/12/2025, 12:00:00 AM"
        // dd/mm/yyyy, hh:mm:ss AM/PM
        const m = s.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM))?$/i
        );

        if (m) {
            const dd = parseInt(m[1], 10);
            const mm = parseInt(m[2], 10);
            const yyyy = parseInt(m[3], 10);

            let hh = m[4] ? parseInt(m[4], 10) : 0;
            const min = m[5] ? parseInt(m[5], 10) : 0;
            const sec = m[6] ? parseInt(m[6], 10) : 0;
            const ampm = (m[7] || "").toUpperCase();

            // convert 12-hour to 24-hour
            if (ampm === "PM" && hh < 12) hh += 12;
            if (ampm === "AM" && hh === 12) hh = 0;

            // This creates a LOCAL date-time (because your string has no timezone info)
            dateObj = new Date(yyyy, mm - 1, dd, hh, min, sec);
        } else {
            // Fallback: ISO or browser-parseable string
            dateObj = new Date(s);
        }
    }

    if (!dateObj || Number.isNaN(dateObj.getTime())) return "-";

    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });

    return `${month} ${day}, ${weekday}`;
}

export const formatUtcToLocal = (utcTime, format = "hh:mm A") => {
    if (!utcTime) return "";
    return dayjs.utc(utcTime).tz(userTimeZone).format(format);
};

export const fetchAllTimeZones = async () => {
    try {
        // const response = axiosInterceptor().get(`${timeZoneURL}`)
        // const timeZones = response?.data?.result;

        const response = await fetch(`https://timeapi.io/api/timezone/availabletimezones`)
        const timeZones = await response.json();
        const formattedTimeZones = timeZones?.map((zone, index) => {
            const now = new Date();

            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: zone,
                timeZoneName: "longOffset",
            });

            const parts = formatter.formatToParts(now);
            let offsetString = parts.find((part) => part.type === "timeZoneName")?.value || "";
            offsetString = offsetString.replace("GMT", "UTC");

            return { id: index + 1, title: `(${offsetString}) ${zone}`, zone: `${zone}` };
        });
        return formattedTimeZones;
        // return response;
    } catch (error) {
        console.error("Error fetching time zones:", error);
        return []; // Return an empty array on failure
    }
}

export const getAllCountryList = async () => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/all`, {
            method: 'GET',
        })
        const data = await response.json();
        const simplifiedData = data?.map((country, index) => ({
            id: index + 1,
            title: country.name?.common || '',
            flag: country.flags?.png || '',
        }));
        return simplifiedData;
    } catch (error) {
        console.log(error)
    }
}

export const getListOfYears = () => {
    try {
        const currentYear = new Date().getFullYear();
        const startYear = 2000;

        const years = Array.from(
            { length: currentYear - startYear + 1 },
            (_, index) => startYear + index
        );
        return years.map(year => ({ id: year, title: year.toString() }))?.reverse();
    } catch (error) {
        console.error("Error fetching years:", error);
        return [];
    }
}

export const getStaticRoles = () => {
    return [
        {
            id: 1,
            title: 'Owner',
        },
        {
            id: 2,
            title: 'Admin',
        },
        {
            id: 3,
            title: 'Manager',
        },
    ];
}

export const getStaticRolesWithPermissions = () => {
    return getStaticRoles()?.map((item, index) => {
        return {
            roleName: item.title,
            rolesActions: {
                "functionalities": [
                    {
                        "functionalityId": 1,
                        "functionalityName": "Company",
                        "modules": [
                            {
                                "moduleId": 3,
                                "moduleName": "Manage Company",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 5,
                                "moduleName": "Manage Employees",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 9,
                                "moduleName": "Manage Shifts",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                        ]
                    },
                    {
                        "functionalityId": 3,
                        "functionalityName": "Permission",
                        "modules": [
                            {
                                "moduleId": 2,
                                "moduleName": "Role",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 6,
                                "moduleName": "Department",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 15,
                                "moduleName": "Salary Statement",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            }
                        ]
                    },
                    {
                        "functionalityId": 4,
                        "functionalityName": "Time Card",
                        "modules": [
                            {
                                "moduleId": 8,
                                "moduleName": "Clock-In-Out",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                        ]
                    },
                    {
                        "functionalityId": 6,
                        "functionalityName": "Automation Rules",
                        "modules": [
                            {
                                "moduleId": 16,
                                "moduleName": "Overtime Rules",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 18,
                                "moduleName": "Weekly Holidays",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 19,
                                "moduleName": "Holidays Template",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 20,
                                "moduleName": "Late Entry Rules",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                            {
                                "moduleId": 21,
                                "moduleName": "Early Exit Rules",
                                "moduleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "roleAssignedActions": [
                                    1,
                                    2,
                                    3,
                                    4
                                ]
                            },
                        ]
                    },
                ]
            }
        }
    })
}

export const apiToLocalTime = (utcString) => {
    if (!utcString) return null;
    return dayjs.utc(utcString, "DD/MM/YYYY, hh:mm:ss A").tz(userTimeZone);
};

export const localToApiTime = (localTime) => {
    if (!localTime) return null;
    return localTime.utc().toISOString(); // ✅ gives "2025-09-06T05:20:14.000Z"
};

export const formatShiftDisplay = (time) => {
    if (!time) return "";

    const start = dayjs.utc(time.start).tz(userTimeZone).format("hh:mm A");
    const end = dayjs.utc(time.end).tz(userTimeZone).format("hh:mm A");

    if (time.shiftType === "Hourly") {
        return `${time.shiftName} (${time.shiftType} - ${time.hours} hrs)`;
    } else if (time.shiftType === "Time Based") {
        return `${time.shiftName} (${time.shiftType} - ${start} - ${end})`;
    } else {
        return time.shiftName;
    }
};


export async function playBeep() {
    try {
        const audio = new Audio('/audio/public-domain-beep-sound.mp3');
        audio.preload = 'auto';
        audio.currentTime = 0;
        await audio.play();
        console.log("Beep played");
    } catch (err) {
        console.warn("Beep playback failed:", err);
    }
}

export const speakMessage = (message) => {
    try {
        if (!window.speechSynthesis) {
            console.error("Browser does not support Speech Synthesis");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(message);

        // Pick a female English voice if available
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);

        let selectedVoice = voices.find(
            (v) => v.lang.toLowerCase().startsWith("en") && /female/i.test(v.name)
        );

        if (!selectedVoice) {
            // Fallback: any English voice
            selectedVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        }

        // Final fallback: first available voice
        if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error("TTS error:", err);
    }
};

export const filterOptionsByMonth = [
    { id: 1, title: 'January', value: 0 },
    { id: 2, title: 'February', value: 1 },
    { id: 3, title: 'March', value: 2 },
    { id: 4, title: 'April', value: 3 },
    { id: 5, title: 'May', value: 4 },
    { id: 6, title: 'June', value: 5 },
    { id: 7, title: 'July', value: 6 },
    { id: 8, title: 'August', value: 7 },
    { id: 9, title: 'September', value: 8 },
    { id: 10, title: 'October', value: 9 },
    { id: 11, title: 'November', value: 10 },
    { id: 12, title: 'December', value: 11 }
];