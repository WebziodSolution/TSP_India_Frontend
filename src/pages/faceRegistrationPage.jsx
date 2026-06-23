import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { FaceDetection } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { connect } from 'react-redux';
import { setAlert } from '../redux/commonReducers/commonReducers';

import { faceRecognitionAPIBaseURL, faceRecognitionModelURL, radarPKAPIKey } from '../config/apiConfig/apiConfig';

import Components from '../components/muiComponents/components';
import CustomIcons from '../components/common/icons/CustomIcons';
import { playBeep, speakMessage } from '../service/common/commonService';
import { addUserTimeInPhone } from '../service/userInOut/userInOut';
import { getAccurateLocation } from '../service/common/radarService';
import { getLocations } from '../service/location/locationService';
import { login } from '../service/auth/authService';

const API_BASE_URL = faceRecognitionAPIBaseURL;
const modelsPath = faceRecognitionModelURL;

function FaceRegistrationPage({ setAlert }) {

    const faceAlignedRef = useRef(false);
    const countdownIntervalRef = useRef(null);
    const webcamVideoRef = useRef(null);
    const capturedPhotoRef = useRef(null);
    const photoCanvasRef = useRef(null);
    const detectionCanvasRef = useRef(null);
    const faceFrameRef = useRef(null);
    const webcamDisplayRef = useRef(null);
    const capturedDisplayRef = useRef(null);
    const countdownActiveRef = useRef(false);
    const faceDetectionIntervalRef = useRef(null);

    const [currentStream, setCurrentStream] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isPhotoAlreadyCaptured, setIsPhotoAlreadyCaptured] = useState(false); // Manages visibility
    const [registerMessage, setRegisterMessage] = useState({ text: '', type: '' });
    const [detectionReady, setDetectionReady] = useState(false);

    const checkGeofenceStatus = async (allowedExternalIds, radarUserId) => {
        try {
            const location = await getAccurateLocation();

            if (!window.Radar) {
                console.error("Radar SDK not loaded.");
                return false;
            }

            if (!location?.latitude || !location?.longitude) {
                console.error("Location data not available.");
                return false;
            }

            const { latitude, longitude, accuracy } = location;

            const formattedLatitude = parseFloat(latitude.toFixed(5));
            const formattedLongitude = parseFloat(longitude.toFixed(5));

            window.Radar.initialize(radarPKAPIKey);
            window.Radar.setUserId(`timesheetspro_user_${radarUserId}`);

            return new Promise((resolve) => {
                window.Radar.trackOnce(
                    {
                        latitude: formattedLatitude,
                        longitude: formattedLongitude,
                        accuracy: Math.min(accuracy, 30),
                    },
                    (status, loc, user, events) => {
                        const geofences = [
                            ...(user?.user?.geofences || []),
                            ...(events?.map(e => e?.geofence).filter(Boolean) || []),
                        ];

                        for (const g of geofences) {
                            const geofenceExternalId = g?.externalId;
                            if (allowedExternalIds.map(loc => loc.externalId).includes(geofenceExternalId)) {
                                const locationId = allowedExternalIds.find(loc => loc.externalId === geofenceExternalId)?.locationId;
                                if (locationId !== undefined) {
                                    console.log("✅ Matched geofence:", geofenceExternalId);
                                    resolve({ isInside: true, locationId });
                                    return;
                                }
                            }
                        }

                        console.log("❌ No matching geofence found.");
                        resolve({ isInside: false, location });
                    }
                );
            });
        } catch (error) {
            console.error("Error checking geofence status:", error);
            return { isInside: false, location: null };
        }
    };

    const handleClockIn = async (employeeId, locationId, companyId) => {
        let params = `employeeId=${employeeId}`;
        if (locationId) {
            params += `&locationId=${locationId}`;
        }
        if (companyId) {
            params += `&companyId=${companyId}`;
        }
        try {
            const response = await addUserTimeInPhone(params);
            if (response?.data?.status === 201) {
                setAlert({
                    open: true,
                    message: response.data.message || "Clock-in successful",
                    type: "success"
                });
                await speakMessage("Thank you, You are in.");
            } else if (response?.data?.status === 200) {
                setAlert({
                    open: true,
                    message: response.data.message || "Clock-out successful",
                    type: "success"
                });
                await speakMessage("Thank you, You are out.");
            }
            else {
                setAlert({
                    open: true,
                    message: response.data.message || "Clock-in failed",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Error during clock-in:", error);
        }
    };

    const submit = async (data) => {
        console.log("data", data)
        const response = await login(data)
        let locationId = null;
        let companyId = response?.data?.result?.data?.companyId;

        if (response.data.status === 200) {
            if (response?.data?.result?.data?.checkGeofence === 1 && response?.data?.result?.data?.roleName !== 'Admin' && response?.data?.result?.data?.roleName !== 'Owner') {
                if (response.data.result?.data?.companyLocation) {
                    const locations = await getLocations(JSON.parse(response.data.result?.data?.companyLocation));
                    if (locations.data.status === 200) {
                        const locationData = locations?.data?.result?.map(item => ({
                            externalId: item.externalId,
                        }));

                        if (locationData?.some(loc => loc.externalId === '' || loc.externalId === null || loc.externalId === undefined)) {
                            setAlert({
                                open: true,
                                message: "Geofence data is missing or incomplete for one or more locations. Please configure geofencing for your company's location(s) to proceed.",
                                type: "error"
                            });
                            return;
                        }
                        const allowedExternalIds = locationData?.map((loc, i) => {
                            return {
                                externalId: loc.externalId,
                                locationId: i.id
                            }
                        });

                        const isInsideGeofence = await checkGeofenceStatus(allowedExternalIds, response.data.result?.data?.employeeId);
                        if (isInsideGeofence?.locationId) {
                            locationId = isInsideGeofence.locationId;
                        }
                        if (!isInsideGeofence?.isInside) {
                            setAlert({
                                open: true,
                                message: "You are not inside the geofenced area.",
                                type: "error"
                            });
                            return
                        } else {
                            handleClockIn(response?.data.result?.data?.employeeId, locationId, companyId)
                        }
                    }
                }
            } else {
                handleClockIn(response?.data.result?.data?.employeeId, locationId, companyId)
            }
        } else {
            if (response?.data?.message) {
                setAlert({ open: true, message: response.data.message, type: "error" });
            } else {
                setAlert({ open: true, message: "Login failed. Please try again.", type: "error" });
            }
        }
    };


    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n); // Corrected typo
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const showMessage = (setter, msg, type) => {
        setter({ text: msg, type });
    };

    const clearMessage = (setter) => {
        setter({ text: '', type: '' });
    };

    const loadModels = async () => {
        try {
            await faceapi.nets.tinyFaceDetector.load(modelsPath);
            setModelsLoaded(true);
            console.log('Face-API models loaded successfully.');
            showMessage(setRegisterMessage, 'Models loaded. Starting webcam...', 'info');
        } catch (error) {
            console.error('Failed to load face-api.js models:', error);
            showMessage(setRegisterMessage, 'Error loading face detection models. Please refresh.', 'error');
        }
    };

    const detectFaces = async () => {
        if (isPhotoAlreadyCaptured) {
            console.log('detectFaces: Photo already captured, skipping detection cycle.');
            return;
        }

        if (!webcamVideoRef.current || webcamVideoRef.current.paused || webcamVideoRef.current.ended || !modelsLoaded) {
            console.log('detectFaces: Webcam or models not ready.');
            return;
        }

        try {
            const detection = await faceapi.detectSingleFace(
                webcamVideoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );

            if (!detection || detection.score < 0.6) {
                if (!isPhotoAlreadyCaptured) {
                    showMessage(setRegisterMessage, 'No face detected. Please stand in front of the camera.', 'info');
                }
                faceAlignedRef.current = false;
                if (faceFrameRef.current) {
                    faceFrameRef.current.style.borderColor = "#ef4444"; // Red
                    faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#ef4444");
                }
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                    countdownActiveRef.current = false;
                }
                return;
            }

            const displaySize = {
                width: webcamVideoRef.current.offsetWidth,
                height: webcamVideoRef.current.offsetHeight
            };
            const resizedDetection = faceapi.resizeResults(detection, displaySize);

            // Draw detection box
            if (detectionCanvasRef.current) {
                const ctx = detectionCanvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, detectionCanvasRef.current.width, detectionCanvasRef.current.height);
                // faceapi.draw.drawDetections(detectionCanvasRef.current, resizedDetection);
            }

            const faceBox = resizedDetection.box;
            const frameRect = faceFrameRef.current.getBoundingClientRect();
            const videoRect = webcamVideoRef.current.getBoundingClientRect();

            const frameX = frameRect.left - videoRect.left;
            const frameY = frameRect.top - videoRect.top;
            const frameWidth = frameRect.width;
            const frameHeight = frameRect.height;

            const scaleX = webcamVideoRef.current.videoWidth / webcamVideoRef.current.offsetWidth;
            const scaleY = webcamVideoRef.current.videoHeight / webcamVideoRef.current.offsetHeight;

            const scaledFaceBox = new faceapi.Rect(
                faceBox.x * scaleX,
                faceBox.y * scaleY,
                faceBox.width * scaleX,
                faceBox.height * scaleY
            );

            const scaledFrameX = frameX * scaleX;
            const scaledFrameY = frameY * scaleY;
            const scaledFrameWidth = frameWidth * scaleX;
            const scaledFrameHeight = frameHeight * scaleY;

            // Relaxed margin to allow easier face alignment (especially on phones)
            const relaxedMarginX = scaledFrameWidth * 0.05; // 5%
            const relaxedMarginY = scaledFrameHeight * 0.07; // 7%

            const isWithinFrame =
                scaledFaceBox.x + scaledFaceBox.width > scaledFrameX + relaxedMarginX &&
                scaledFaceBox.y + scaledFaceBox.height > scaledFrameY + relaxedMarginY &&
                scaledFaceBox.x < scaledFrameX + scaledFrameWidth - relaxedMarginX &&
                scaledFaceBox.y < scaledFrameY + scaledFrameHeight - relaxedMarginY;

            if (isWithinFrame) {
                faceAlignedRef.current = true;
                faceFrameRef.current.style.borderColor = "#22c55e"; // Green
                faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#22c55e");

                if (!isPhotoAlreadyCaptured && !countdownActiveRef.current) {
                    countdownActiveRef.current = true;
                    let countdown = 2;
                    countdownIntervalRef.current = setInterval(() => {
                        countdown--;
                        if (countdown > 0) {
                        } else {
                            clearInterval(countdownIntervalRef.current);
                            countdownIntervalRef.current = null;
                            countdownActiveRef.current = false;
                            capturePhoto();
                        }
                    }, 1000);
                }
            } else {
                faceAlignedRef.current = false;
                faceFrameRef.current.style.borderColor = "#ef4444"; // Red
                faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#ef4444");

                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                    countdownActiveRef.current = false;
                    showMessage(setRegisterMessage, 'Face moved out of alignment. Please re-center.', 'warning');
                } else if (!isPhotoAlreadyCaptured) {
                    showMessage(setRegisterMessage, 'Please position your face within the frame.', 'info');
                }
            }

        } catch (err) {
            console.error('Face detection error:', err);
        }
    };

    const onResults = (results) => {
        if (!results.detections || results.detections.length === 0) {
            faceAlignedRef.current = false;
            if (faceFrameRef.current) {
                faceFrameRef.current.style.borderColor = "#ef4444";
            }
            showMessage(setRegisterMessage, 'No face detected.', 'info');
            return;
        }

        const detection = results.detections[0];
        const box = detection.boundingBox;

        const frameRect = faceFrameRef.current.getBoundingClientRect();
        const videoRect = webcamVideoRef.current.getBoundingClientRect();

        const faceBox = {
            x: box.xCenter - box.width / 2,
            y: box.yCenter - box.height / 2,
            width: box.width,
            height: box.height,
        };

        const faceLeft = faceBox.x * videoRect.width;
        const faceTop = faceBox.y * videoRect.height;
        const faceWidth = faceBox.width * videoRect.width;
        const faceHeight = faceBox.height * videoRect.height;

        const frameLeft = frameRect.left - videoRect.left;
        const frameTop = frameRect.top - videoRect.top;
        const frameRight = frameLeft + frameRect.width;
        const frameBottom = frameTop + frameRect.height;

        const isWithinFrame =
            faceLeft > frameLeft + 10 &&
            faceTop > frameTop + 10 &&
            faceLeft + faceWidth < frameRight - 10 &&
            faceTop + faceHeight < frameBottom - 10;

        if (isWithinFrame) {
            faceAlignedRef.current = true;
            faceFrameRef.current.style.borderColor = "#22c55e";

            if (!isPhotoAlreadyCaptured && !countdownActiveRef.current) {
                countdownActiveRef.current = true;
                let countdown = 2;
                countdownIntervalRef.current = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                        countdownActiveRef.current = false;
                        capturePhoto();
                    }
                }, 1000);
            }
        } else {
            faceAlignedRef.current = false;
            faceFrameRef.current.style.borderColor = "#ef4444";
            showMessage(setRegisterMessage, 'Face not aligned in frame.', 'warning');
        }
    };

    const startWebcam = async () => {
        clearMessage(setRegisterMessage);
        setIsPhotoAlreadyCaptured(false);

        if (webcamDisplayRef.current) webcamDisplayRef.current.classList.remove('hidden');
        if (capturedDisplayRef.current) capturedDisplayRef.current.classList.add('hidden');

        const videoElement = webcamVideoRef.current;

        // *** 1. Get the high-quality stream manually ***
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 }, // Your desired HD width
                    height: { ideal: 720 }, // Your desired HD height
                    facingMode: 'user'
                }
            });

            // *** 2. Attach the stream to the video element ***
            videoElement.srcObject = stream;

            // This is important: wait for the video to load metadata 
            // before proceeding, especially for setting dimensions.
            await new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play(); // Start playing the stream
                    resolve();
                };
            });

        } catch (err) {
            console.error("Error accessing the webcam: ", err);
            // Handle error (e.g., show a message to the user)
            return;
        }

        const faceDetection = new FaceDetection({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        });

        faceDetection.setOptions({
            model: 'short',
            minDetectionConfidence: 0.6,
        });

        faceDetection.onResults(onResults);

        // *** 3. Use requestAnimationFrame or a simple loop for the MediaPipe processing ***
        // The previous Camera utility handled the onFrame logic. We replace it.

        const sendToMediaPipe = async () => {
            if (!isPhotoAlreadyCaptured && videoElement.readyState >= 2) { // readyState >= 2 means enough data to process frames
                await faceDetection.send({ image: videoElement });
            }
            // Loop continuously to process frames
            requestAnimationFrame(sendToMediaPipe);
        };

        // Start the frame processing loop
        sendToMediaPipe();

        // NOTE: If you were using the MediaPipe Camera utility to manage stream stopping, 
        // you now need to manage it manually (e.g., stopping the tracks on the stream 
        // when you're done with the webcam).

        setDetectionReady(true);
    };

    const stopWebcam = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }

        countdownActiveRef.current = false;
        faceAlignedRef.current = false;

        clearMessage(setRegisterMessage);
        setIsPhotoAlreadyCaptured(false);
    };

    const capturePhoto = async () => {

        if (!webcamVideoRef.current || webcamVideoRef.current.readyState < 2) {
            showMessage(setRegisterMessage, 'Webcam not ready yet.', 'error');
            return;
        }


        if (!faceAlignedRef.current) {
            await playBeep();
            console.log('Capture failed: Face not aligned at capture moment');
            showMessage(setRegisterMessage, 'Face moved out of alignment before capture. Please re-center.', 'warning');
            return;
        }

        try {
            const videoWidth = webcamVideoRef.current.videoWidth;
            const videoHeight = webcamVideoRef.current.videoHeight;
            const displayWidth = webcamVideoRef.current.offsetWidth;
            const displayHeight = webcamVideoRef.current.offsetHeight;

            const frameRect = faceFrameRef.current.getBoundingClientRect();
            const videoRect = webcamVideoRef.current.getBoundingClientRect();

            const frameX_display = frameRect.left - videoRect.left;
            const frameY_display = frameRect.top - videoRect.top;
            const frameWidth_display = frameRect.width;
            const frameHeight_display = frameRect.height;

            const scaleX = videoWidth / displayWidth;
            const scaleY = videoHeight / displayHeight;

            const paddingPercentage = 0.1;

            const sourceX = Math.max(0, (frameX_display * scaleX) - (frameWidth_display * scaleX * paddingPercentage));
            const sourceY = Math.max(0, (frameY_display * scaleY) - (frameHeight_display * scaleY * paddingPercentage));
            const sourceWidth = Math.min(videoWidth - sourceX, (frameWidth_display * scaleX) * (1 + paddingPercentage * 2));
            const sourceHeight = Math.min(videoHeight - sourceY, (frameHeight_display * scaleY) * (1 + paddingPercentage * 2));

            photoCanvasRef.current.width = sourceWidth;
            photoCanvasRef.current.height = sourceHeight;
            const context = photoCanvasRef.current.getContext('2d');

            context.drawImage(
                webcamVideoRef.current,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, photoCanvasRef.current.width, photoCanvasRef.current.height
            );

            const dataURL = photoCanvasRef.current.toDataURL('image/jpeg', 0.9);
            if (capturedPhotoRef.current) capturedPhotoRef.current.src = dataURL;

            // --- VISIBILITY CONTROL ---
            webcamDisplayRef.current?.classList.add('hidden'); // Hide webcam
            capturedDisplayRef.current?.classList.remove('hidden'); // Show captured photo

            setIsPhotoAlreadyCaptured(true); // This state change is key for stopping detection
            faceAlignedRef.current = false;

            // Ensure all intervals are stopped after capture
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
                faceDetectionIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                console.log('capturePhoto: Stopped countdown interval.');
            }
            countdownActiveRef.current = false;
            console.log("Face captured successfully! You can now register.");
            showMessage(setRegisterMessage, 'Face captured successfully! You can now register.', 'success');
            registerUser(dataURL)
        } catch (err) {
            console.error('Error capturing photo:', err);
            showMessage(setRegisterMessage, 'Error capturing photo. Please try again.', 'error');
        }
    };

    const retakePhoto = () => {
        clearMessage(setRegisterMessage);
        clearMessage(setRegisterMessage);
        setIsPhotoAlreadyCaptured(false); // This state change is key for restarting detection
        countdownActiveRef.current = false;

        // --- VISIBILITY CONTROL ---
        capturedDisplayRef.current?.classList.add('hidden'); // Hide captured photo
        webcamDisplayRef.current?.classList.remove('hidden'); // Show webcam

        startWebcam(); // This will re-initialize the webcam and its state, triggering useEffect to restart detection
    };

    const registerUser = async (dataURL) => {
        clearMessage(setRegisterMessage);
        if (!dataURL) {
            await playBeep();
            showMessage(setRegisterMessage, 'No captured face detected. Please retake or capture a new face.', 'error');
            return;
        }

        const imageBlob = dataURLtoBlob(dataURL);
        const formData = new FormData();

        const fieldName = "file";
        const fileName = "login.jpg";
        const apiEndpoint = "/login";

        formData.append(fieldName, imageBlob, fileName);

        try {
            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setTimeout(() => {
                    retakePhoto();
                }, 6000);
                submit(data);
            } else {
                await playBeep();
                setTimeout(() => {
                    retakePhoto();
                }, 4000);
                setAlert({
                    open: true,
                    type: 'error',
                    message: `${data.detail || 'Unknown error.'}`
                });
            }
        } catch (error) {
            setTimeout(() => {
                retakePhoto();
            }, 3000);
            setAlert({
                open: true,
                type: 'error',
                message: `Login failed due to network or server error.`
            });
        }
    };

    useEffect(() => {
        if (modelsLoaded && currentStream && webcamVideoRef.current && !isPhotoAlreadyCaptured) {
            // Clear any existing interval before setting a new one
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
            }
            // faceDetectionIntervalRef.current = setInterval(detectFaces, 150);
            faceDetectionIntervalRef.current = setInterval(detectFaces, 300);
        } else {
            // Stop detection if conditions are not met (e.g., photo captured, stream stopped)
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
                faceDetectionIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                countdownActiveRef.current = false;
            }
            // This is important: if detection stops because a photo was captured, reset faceAlignedRef
            if (isPhotoAlreadyCaptured) {
                faceAlignedRef.current = false;
            }
        }

        // Cleanup for this specific effect
        return () => {
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
                faceDetectionIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            countdownActiveRef.current = false;
        };
    }, [modelsLoaded, currentStream, isPhotoAlreadyCaptured]);


    useEffect(() => {
        loadModels().then(startWebcam);
    }, []);

    return (
        <>
            <div className='flex justify-center items-center h-screen'>
                <div className="bg-white w-[300px] max-w-md flex flex-col gap-5 text-center">
                    <div
                        id="webcamDisplay"
                        ref={webcamDisplayRef}
                        className={`video-container relative rounded-lg overflow-hidden bg-black h-[28rem] ${isPhotoAlreadyCaptured ? 'hidden' : ''}`}
                    >
                        <video
                            id="webcamVideo"
                            ref={webcamVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                        <canvas
                            id="detectionCanvas"
                            ref={detectionCanvasRef}
                            className="absolute top-0 left-0 w-full h-full"
                        />
                        <div
                            className="face-frame absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 md:w-52 h-4/5 md:max-w-[25rem] max-h-[32rem] border-2 border-opacity-80 border-red-500 rounded-xl pointer-events-none z-10 transition-colors"
                            ref={faceFrameRef}
                        >
                            <div className="corner tl absolute top-[-2px] left-[-2px] w-5 h-5 border-4 border-blue-500 border-r-0 border-b-0 rounded-tl-lg"></div>
                            <div className="corner tr absolute top-[-2px] right-[-2px] w-5 h-5 border-4 border-blue-500 border-l-0 border-b-0 rounded-tr-lg"></div>
                            <div className="corner bl absolute bottom-[-2px] left-[-2px] w-5 h-5 border-4 border-blue-500 border-r-0 border-t-0 rounded-bl-lg"></div>
                            <div className="corner br absolute bottom-[-2px] right-[-2px] w-5 h-5 border-4 border-blue-500 border-l-0 border-t-0 rounded-br-lg"></div>
                        </div>
                    </div>

                    <div
                        id="capturedDisplay"
                        ref={capturedDisplayRef}
                        className={`captured-display relative rounded-lg overflow-hidden shadow h-[28rem] w-full max-w-[500px] mx-auto ${!isPhotoAlreadyCaptured ? 'hidden' : ''
                            }`}
                    >
                        <img
                            id="capturedPhoto"
                            ref={capturedPhotoRef}
                            alt="Captured Preview"
                            className=" w-full h-full object-cover rounded-lg"
                        />

                        {/* Retake Button Overlay */}
                        <div className='absolute bottom-5 right-2 z-50 bg-white bg-opacity-90 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform'>
                            <Components.IconButton
                                id="retakeIcon"
                                onClick={retakePhoto}
                            >
                                <CustomIcons iconName="fa-solid fa-rotate-left" css="text-blue-600 w-5 h-5" />
                            </Components.IconButton>
                        </div>
                    </div>


                    <canvas id="photoCanvas" ref={photoCanvasRef} className="hidden"></canvas>
                </div>
            </div>
        </>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(FaceRegistrationPage);


// https://chatgpt.com/share/68c03d60-8ec4-8001-8e79-c04769c3ad25