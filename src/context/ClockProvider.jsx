import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { addUserTimeIn, getUserLastInOut, updateUserTimeIn } from "../service/userInOut/userInOut";

// Your backend time format: "29/01/2026, 05:28:39 PM" (DD/MM/YYYY)
const parseUTCToLocal = (s) => {
    if (!s) return null;

    const [datePart, timePartRaw] = s.split(",").map((t) => t.trim());
    if (!datePart || !timePartRaw) return null;

    const [dd, mm, yyyy] = datePart.split("/").map(Number);

    const [timePart, ampmRaw] = timePartRaw.split(" ");
    let [hh, min, ss] = timePart.split(":").map(Number);

    const ampm = (ampmRaw || "").toUpperCase();
    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;

    // treat provided string as UTC time
    return new Date(Date.UTC(yyyy, mm - 1, dd, hh, min, ss));
};

const ClockContext = createContext(null);

export const ClockProvider = ({ children, onStatusChange }) => {
    // onStatusChange is optional: useful to update Redux handleSetTimeIn etc.
    const userInfoRef = useRef(null);
    const tickRef = useRef(null);

    const [isRunning, setIsRunning] = useState(false);

    // store the "timeIn" as a UTC-ms timestamp for accurate difference
    const [startUtcMs, setStartUtcMs] = useState(null);

    // derived live seconds
    const [elapsedSec, setElapsedSec] = useState(0);

    const stopTicker = () => {
        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = null;
    };

    const startTicker = () => {
        stopTicker();
        tickRef.current = setInterval(() => {
            setElapsedSec((prev) => prev + 1);
        }, 1000);
    };

    const hydrateFromBackend = async () => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
        userInfoRef.current = userInfo;

        if (!userInfo?.employeeId) {
            setIsRunning(false);
            setStartUtcMs(null);
            setElapsedSec(0);
            return;
        }

        const res = await getUserLastInOut(userInfo.employeeId);

        // if backend says user has an active timeIn (no timeOut)
        if (res?.data?.result?.timeIn && !res?.data?.result?.timeOut) {
            const timeInDate = parseUTCToLocal(res.data.result.timeIn);
            if (!timeInDate || Number.isNaN(timeInDate.getTime())) {
                setIsRunning(false);
                setStartUtcMs(null);
                setElapsedSec(0);
                return;
            }

            const now = Date.now();
            const start = timeInDate.getTime(); // UTC-ms
            const diffSec = Math.max(0, Math.floor((now - start) / 1000));

            setStartUtcMs(start);
            setElapsedSec(diffSec);
            setIsRunning(true);
            localStorage.setItem("timeIn", "true");
            onStatusChange?.(true);
            return;
        }

        // otherwise user is not clocked in
        setIsRunning(false);
        setStartUtcMs(null);
        setElapsedSec(0);
        localStorage.removeItem("timeIn");
        onStatusChange?.(false);
    };

    // initial hydration once
    useEffect(() => {
        hydrateFromBackend();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // start/stop the single shared interval based on isRunning
    useEffect(() => {
        if (isRunning) startTicker();
        else stopTicker();

        return () => stopTicker();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    const clockIn = async () => {
        if (isRunning) return;

        const userInfo = userInfoRef.current || JSON.parse(localStorage.getItem("userInfo") || "null");
        if (!userInfo?.companyId) return;

        const locationId =
            sessionStorage.getItem("locationId") !== undefined && sessionStorage.getItem("locationId") !== null
                ? sessionStorage.getItem("locationId")
                : "";

        const response = await addUserTimeIn(locationId, userInfo.companyId);

        if (response?.data?.status === 201) {
            // If backend returns timeIn, you can parse it; otherwise start now
            const now = Date.now();

            setStartUtcMs(now);
            setElapsedSec(0);
            setIsRunning(true);

            localStorage.setItem("timeIn", "true");
            localStorage.setItem("timeInId", response.data.result.id);

            onStatusChange?.(true);
        }
    };

    const clockOut = async () => {
        if (!isRunning) return;

        const id = localStorage.getItem("timeInId");
        if (!id) return;

        const response = await updateUserTimeIn(parseInt(id));

        if (response?.data?.status === 200) {
            setIsRunning(false);
            setStartUtcMs(null);
            setElapsedSec(0);

            localStorage.removeItem("timeIn");
            localStorage.removeItem("timeInId");
            onStatusChange?.(false);
        }
    };

    const value = useMemo(
        () => ({
            isRunning,
            elapsedSec,
            startUtcMs,
            clockIn,
            clockOut,
            refreshFromBackend: hydrateFromBackend,
        }),
        [isRunning, elapsedSec, startUtcMs]
    );

    return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
};

export const useClock = () => {
    const ctx = useContext(ClockContext);
    if (!ctx) throw new Error("useClock must be used inside ClockProvider");
    return ctx;
};

// helper for UI
export const formatTimeHHMMSS = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
};
