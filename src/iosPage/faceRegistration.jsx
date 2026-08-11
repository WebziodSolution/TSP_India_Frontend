import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { connect } from 'react-redux';
import { setAlert } from '../redux/commonReducers/commonReducers';

import { faceRecognitionAPIBaseURL, faceRecognitionModelURL } from '../config/apiConfig/apiConfig';

import Components from '../components/muiComponents/components';
import CustomIcons from '../components/common/icons/CustomIcons';
import { isNative, checkCameraPermission } from '../utils/platform';
import { playBeep } from '../service/common/commonService';

const API_BASE_URL = faceRecognitionAPIBaseURL;
const modelsPath = faceRecognitionModelURL;

function FaceRegistration({ setAlert, setLoginInfo }) {

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
    const latestDescriptorRef = useRef(null);
    const isDetectingRef = useRef(false);
    const currentStreamRef = useRef(null);
    const detectorOptionsRef = useRef(new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }));

    const [currentStream, setCurrentStream] = useState(null);
    const [capturedImageDataURL, setCapturedImageDataURL] = useState(null);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isPhotoAlreadyCaptured, setIsPhotoAlreadyCaptured] = useState(false); // Manages visibility
    const [registerMessage, setRegisterMessage] = useState({ text: '', type: '' });

    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
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
        if (
            faceapi.nets.tinyFaceDetector.isLoaded &&
            faceapi.nets.faceLandmark68Net.isLoaded &&
            faceapi.nets.faceRecognitionNet.isLoaded
        ) {
            setModelsLoaded(true);
            return;
        }
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.load(modelsPath),
                faceapi.nets.faceLandmark68Net.load(modelsPath),
                faceapi.nets.faceRecognitionNet.load(modelsPath)
            ]);
            setModelsLoaded(true);
            console.log('Face-API models loaded successfully.');
        } catch (error) {
            console.error('Failed to load face-api.js models:', error);
            showMessage(setRegisterMessage, 'Error loading face detection models. Please refresh.', 'error');
        }
    };

    const handlePlayVideo = async (videoElement) => {
        try {
            await videoElement.play();
        } catch (err) {
            console.log('Video play error:', err);
            videoElement.muted = true;
            try {
                await videoElement.play();
            } catch (err2) {
                console.log('Second video play attempt failed:', err2);
            }
        }
    };

    const detectFaces = async () => {
        if (isPhotoAlreadyCaptured || isDetectingRef.current) {
            return;
        }

        if (!webcamVideoRef.current || webcamVideoRef.current.paused || webcamVideoRef.current.ended || !modelsLoaded) {
            return;
        }

        isDetectingRef.current = true;

        try {
            // Lightweight face detection only during live scanning
            const detection = await faceapi.detectSingleFace(
                webcamVideoRef.current,
                detectorOptionsRef.current
            );

            if (!detection || detection.score < 0.5) {
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
                if (detectionCanvasRef.current) {
                    const ctx = detectionCanvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, detectionCanvasRef.current.width, detectionCanvasRef.current.height);
                }
                return;
            }

            const displaySize = {
                width: webcamVideoRef.current.offsetWidth,
                height: webcamVideoRef.current.offsetHeight
            };
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            const faceBox = resizedDetection.box;

            if (detectionCanvasRef.current) {
                const ctx = detectionCanvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, detectionCanvasRef.current.width, detectionCanvasRef.current.height);
            }

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
                    latestDescriptorRef.current = null;

                    // Pre-compute face descriptor in the background DURING the 2-second countdown
                    // By the time countdown reaches 0, the descriptor is already finished!
                    (async () => {
                        try {
                            if (webcamVideoRef.current && !webcamVideoRef.current.paused) {
                                const fullResult = await faceapi.detectSingleFace(
                                    webcamVideoRef.current,
                                    new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 })
                                ).withFaceLandmarks().withFaceDescriptor();

                                if (fullResult && countdownActiveRef.current) {
                                    latestDescriptorRef.current = JSON.stringify(Array.from(fullResult.descriptor));
                                }
                            }
                        } catch (e) {
                            console.log('Background descriptor computation:', e);
                        }
                    })();

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
                faceFrameRef.current.style.borderColor = "#ef4444"; // Red
                faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#ef4444");

                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                    countdownActiveRef.current = false;
                    latestDescriptorRef.current = null;
                    showMessage(setRegisterMessage, 'Face moved out of alignment. Please re-center.', 'warning');
                } else if (!isPhotoAlreadyCaptured) {
                    showMessage(setRegisterMessage, 'Please position your face within the frame.', 'info');
                }
            }

        } catch (err) {
            console.error('Face detection error:', err);
        } finally {
            isDetectingRef.current = false;
        }
    };

    const stopWebcam = () => {
        if (currentStreamRef.current) {
            currentStreamRef.current.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {}
            });
            currentStreamRef.current = null;
        }

        if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
            try {
                const tracks = webcamVideoRef.current.srcObject.getTracks?.() || [];
                tracks.forEach(track => track.stop());
                webcamVideoRef.current.srcObject = null;
            } catch (e) {}
        }

        setCurrentStream(null);

        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        countdownActiveRef.current = false;
        faceAlignedRef.current = false;
        isDetectingRef.current = false;
    };

    const startWebcam = async (retryCount = 0) => {
        const hadPreviousStream = !!currentStreamRef.current || !!webcamVideoRef.current?.srcObject;
        stopWebcam();

        // If a previous stream was just closed, wait 200ms for OS hardware camera lock to release
        if (hadPreviousStream) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        clearMessage(setRegisterMessage);
        setCapturedImageDataURL(null);
        setFaceDescriptor(null);
        latestDescriptorRef.current = null;
        setIsPhotoAlreadyCaptured(false);
        countdownActiveRef.current = false;

        // Reset face frame border to default
        if (faceFrameRef.current) {
            faceFrameRef.current.style.borderColor = "#ef4444";
            faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#ef4444");
        }

        // --- VISIBILITY CONTROL ---
        if (webcamDisplayRef.current) webcamDisplayRef.current.classList.remove('hidden');
        if (capturedDisplayRef.current) capturedDisplayRef.current.classList.add('hidden');
        if (webcamVideoRef.current) webcamVideoRef.current.classList.remove('hidden');
        if (detectionCanvasRef.current) detectionCanvasRef.current.classList.remove('hidden');
        if (faceFrameRef.current) faceFrameRef.current.classList.remove('hidden');

        if (isNative()) {
            await checkCameraPermission();
        }

        try {
            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (initialErr) {
                console.warn('Initial getUserMedia failed, retrying with basic constraints:', initialErr);
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            }

            currentStreamRef.current = stream;
            setCurrentStream(stream);

            if (webcamVideoRef.current) {
                webcamVideoRef.current.srcObject = stream;
                showMessage(setRegisterMessage, 'Position your face within the frame.', 'info');

                webcamVideoRef.current.onloadedmetadata = async () => {
                    try {
                        await handlePlayVideo(webcamVideoRef.current);
                        const displaySize = {
                            width: webcamVideoRef.current.offsetWidth,
                            height: webcamVideoRef.current.offsetHeight
                        };
                        if (detectionCanvasRef.current) {
                            faceapi.matchDimensions(detectionCanvasRef.current, displaySize);
                        }
                    } catch (err) {
                        console.error('onloadedmetadata: Error in handler:', err);
                        showMessage(setRegisterMessage, 'Error starting webcam. Please try again.', 'error');
                    }
                };
            }

        } catch (err) {
            console.error('startWebcam: Error accessing webcam:', err);

            // Auto-retry if camera hardware was temporarily locked/busy (AbortError / NotReadableError)
            if ((err.name === 'AbortError' || err.name === 'NotReadableError') && retryCount < 2) {
                console.log(`Camera busy (${err.name}), retrying in 400ms... (attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, 400));
                return startWebcam(retryCount + 1);
            }

            showMessage(setRegisterMessage, 'Could not start webcam. Please check permissions.', 'error');
        }
    };

    const capturePhoto = async () => {
        if (!currentStream || !webcamVideoRef.current) {
            console.log('Capture failed: No current stream');
            showMessage(setRegisterMessage, 'Webcam not active.', 'error');
            return;
        }

        if (!faceAlignedRef.current) {
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
            setCapturedImageDataURL(dataURL);
            if (capturedPhotoRef.current) capturedPhotoRef.current.src = dataURL;

            // Check pre-computed descriptor from countdown
            let descriptor = latestDescriptorRef.current;

            // Fallback: If not ready yet, compute once directly from video
            if (!descriptor && webcamVideoRef.current) {
                try {
                    const directResult = await faceapi.detectSingleFace(
                        webcamVideoRef.current,
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
                    ).withFaceLandmarks().withFaceDescriptor();

                    if (directResult) {
                        descriptor = JSON.stringify(Array.from(directResult.descriptor));
                    }
                } catch (err) {
                    console.error("Direct descriptor extraction fallback:", err);
                }
            }

            // --- VISIBILITY CONTROL ---
            webcamDisplayRef.current?.classList.add('hidden'); // Hide webcam
            capturedDisplayRef.current?.classList.remove('hidden'); // Show captured photo

            setIsPhotoAlreadyCaptured(true); // This state change stops detection loop
            faceAlignedRef.current = false;

            // Turn off camera stream hardware immediately once photo is taken
            if (currentStreamRef.current) {
                currentStreamRef.current.getTracks().forEach(track => {
                    try {
                        track.stop();
                    } catch (e) {}
                });
                currentStreamRef.current = null;
            }
            if (webcamVideoRef.current?.srcObject) {
                try {
                    const tracks = webcamVideoRef.current.srcObject.getTracks?.() || [];
                    tracks.forEach(track => track.stop());
                    webcamVideoRef.current.srcObject = null;
                } catch (e) {}
            }
            setCurrentStream(null);

            // Ensure all intervals are stopped after capture
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
                faceDetectionIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            countdownActiveRef.current = false;

            if (descriptor) {
                setFaceDescriptor(descriptor);
                latestDescriptorRef.current = descriptor;
                showMessage(setRegisterMessage, 'Face captured successfully! Logging in...', 'success');
                registerUser(descriptor);
            } else {
                showMessage(setRegisterMessage, 'Could not extract face details clearly. Please retake photo.', 'warning');
            }
        } catch (err) {
            console.error('Error capturing photo:', err);
            showMessage(setRegisterMessage, 'Error capturing photo. Please try again.', 'error');
        }
    };

    const retakePhoto = () => {
        clearMessage(setRegisterMessage);
        setCapturedImageDataURL(null);
        setFaceDescriptor(null);
        latestDescriptorRef.current = null;
        setIsPhotoAlreadyCaptured(false);
        countdownActiveRef.current = false;

        // --- VISIBILITY CONTROL ---
        capturedDisplayRef.current?.classList.add('hidden'); // Hide captured photo
        webcamDisplayRef.current?.classList.remove('hidden'); // Show webcam

        startWebcam();
    };

    const registerUser = async (descriptor) => {
        clearMessage(setRegisterMessage);
        if (!descriptor) {
            await playBeep();
            showMessage(setRegisterMessage, 'No captured face detected. Please retake or capture a new face.', 'error');
            return;
        }

        const formData = new FormData();
        const apiEndpoint = "/login";

        formData.append('faceDescriptor', descriptor);

        try {
            console.log('Sending request to:', `${API_BASE_URL}${apiEndpoint}`);

            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                throw new Error('Invalid server response');
            }

            if (response.ok) {
                stopWebcam();
                setLoginInfo(data);
            } else {
                await playBeep();
                setAlert({
                    open: true,
                    type: 'error',
                    message: `${data.detail || data.message || 'Unknown error.'}`
                });
                setTimeout(() => {
                    retakePhoto();
                }, 3000);
            }
        } catch (error) {
            console.error('Network error details:', error);
            setAlert({
                open: true,
                type: 'error',
                message: `Login failed: ${error.message || 'Network error. Check your connection.'}`
            });
            setTimeout(() => {
                retakePhoto();
            }, 3000);
        }
    };

    useEffect(() => {
        if (modelsLoaded && currentStream && webcamVideoRef.current && !isPhotoAlreadyCaptured) {
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
            }
            // 200ms non-blocking interval leaves CPU/GPU free for smooth 60fps video rendering
            faceDetectionIntervalRef.current = setInterval(detectFaces, 200);
        } else {
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
                faceDetectionIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
                countdownActiveRef.current = false;
            }
            if (isPhotoAlreadyCaptured) {
                faceAlignedRef.current = false;
            }
        }

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
        // Start camera immediately and load models concurrently (zero startup delay)
        startWebcam();
        loadModels();
        return () => {
            stopWebcam();
        };
    }, []);

    return (
        <>
            <div className='flex justify-center items-center h-screen'>
                <div className="w-[300px] max-w-md flex flex-col gap-5 text-center">
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
                            src={capturedImageDataURL || ''}
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

                    {/* {registerMessage.text && (
                        <p className={`message rounded-lg px-3 py-2 text-sm my-2 ${registerMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                            registerMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                                registerMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {registerMessage.text}
                        </p>
                    )} */}

                    <canvas id="photoCanvas" ref={photoCanvasRef} className="hidden"></canvas>
                </div>
            </div>
        </>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(FaceRegistration);