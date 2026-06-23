import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import { faceRecognitionAPIBaseURL, faceRecognitionModelURL } from '../../../config/apiConfig/apiConfig';
import { useNavigate } from 'react-router-dom';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const API_BASE_URL = faceRecognitionAPIBaseURL;
const modelsPath = faceRecognitionModelURL;

function FaceRegistration({ setAlert, open, handleClose, employeeId, type = null, setLoginInfo }) {
    const theme = useTheme();
    const navigate = useNavigate();

    const onClose = () => {
        handleClose(); // Trigger parent to close modal
        stopWebcam(); // Ensure webcam is stopped
    };

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
    const [capturedImageDataURL, setCapturedImageDataURL] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isPhotoAlreadyCaptured, setIsPhotoAlreadyCaptured] = useState(false); // Manages visibility
    const [isLoading, setIsLoading] = useState(false);
    const [registerMessage, setRegisterMessage] = useState({ text: '', type: '' });

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
            // Initial message after models load, before webcam is fully ready
            showMessage(setRegisterMessage, 'Models loaded. Starting webcam...', 'info');
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
                faceapi.draw.drawDetections(detectionCanvasRef.current, resizedDetection);
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

    const startWebcam = async () => {
        stopWebcam();
        clearMessage(setRegisterMessage);
        clearMessage(setRegisterMessage);
        setCapturedImageDataURL(null);
        setIsPhotoAlreadyCaptured(false); // Ensure this is false to restart detection
        countdownActiveRef.current = false;

        // --- VISIBILITY CONTROL ---
        if (webcamDisplayRef.current) webcamDisplayRef.current.classList.remove('hidden');
        if (capturedDisplayRef.current) capturedDisplayRef.current.classList.add('hidden');
        // Ensure detection elements are visible when webcam is active
        if (webcamVideoRef.current) webcamVideoRef.current.classList.remove('hidden');
        if (detectionCanvasRef.current) detectionCanvasRef.current.classList.remove('hidden');
        if (faceFrameRef.current) faceFrameRef.current.classList.remove('hidden');


        // Clean up previous stream if exists
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
            setCurrentStream(null);
        }
        // Also clear any existing face detection interval
        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }


        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            setCurrentStream(stream);

            if (webcamVideoRef.current) {
                webcamVideoRef.current.srcObject = stream;
                showMessage(setRegisterMessage, 'Webcam started. Please position your face within the frame.', 'info'); // Simplified message

                webcamVideoRef.current.onloadedmetadata = async () => {
                    try {
                        await handlePlayVideo(webcamVideoRef.current);
                        // Optional: Add a small delay here if you still face issues with video frames not being ready
                        // await new Promise(resolve => setTimeout(resolve, 100));

                        const displaySize = {
                            width: webcamVideoRef.current.offsetWidth,
                            height: webcamVideoRef.current.offsetHeight
                        };
                        faceapi.matchDimensions(detectionCanvasRef.current, displaySize);
                        // The useEffect with dependencies will handle starting detection
                    } catch (err) {
                        console.error('onloadedmetadata: Error in handler:', err);
                        showMessage(setRegisterMessage, 'Error starting webcam. Please try again.', 'error');
                    }
                };
            }

        } catch (err) {
            console.error('startWebcam: Error accessing webcam:', err);
            showMessage(setRegisterMessage, 'Could not start webcam. Please check permissions.', 'error');
        }
    };

    const stopWebcam = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            setCurrentStream(null);
        }

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

        // Optional: Clear UI state if needed
        clearMessage(setRegisterMessage);
        clearMessage(setRegisterMessage);
        setCapturedImageDataURL(null);
        setIsPhotoAlreadyCaptured(false);
    };

    const capturePhoto = () => {

        if (!currentStream) {
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

            showMessage(setRegisterMessage, 'Face captured successfully! You can now register.', 'success');
        } catch (err) {
            console.error('Error capturing photo:', err);
            showMessage(setRegisterMessage, 'Error capturing photo. Please try again.', 'error');
        }
    };

    const retakePhoto = () => {
        clearMessage(setRegisterMessage);
        clearMessage(setRegisterMessage);
        setCapturedImageDataURL(null);
        setIsPhotoAlreadyCaptured(false); // This state change is key for restarting detection
        countdownActiveRef.current = false;

        // --- VISIBILITY CONTROL ---
        capturedDisplayRef.current?.classList.add('hidden'); // Hide captured photo
        webcamDisplayRef.current?.classList.remove('hidden'); // Show webcam

        startWebcam(); // This will re-initialize the webcam and its state, triggering useEffect to restart detection
    };

    const registerUser = async () => {
        setIsLoading(true);
        clearMessage(setRegisterMessage);

        if (!capturedImageDataURL) {
            setIsLoading(false);
            showMessage(setRegisterMessage, 'No captured face detected. Please retake or capture a new face.', 'error');
            return;
        }

        const imageBlob = dataURLtoBlob(capturedImageDataURL);
        const formData = new FormData();

        const isLogin = type === "login";
        const fieldName = isLogin ? "file" : "image";
        const fileName = isLogin ? "login.jpg" : "register.jpg";
        const apiEndpoint = isLogin ? "/login" : "/register";

        formData.append('employeeId', employeeId);
        formData.append(fieldName, imageBlob, fileName);

        try {
            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setIsLoading(false);
                if (!isLogin) {
                    setAlert({
                        open:true,
                        type: 'success',
                        message: 'Face registered successfully!'
                    });
                    navigate('/dashboard/manageemployees');
                } else {
                    setLoginInfo(data);
                }
                onClose();
            } else {
                setIsLoading(false);
                setAlert({
                    open:true,
                    type: 'error',
                    message: `${isLogin ? 'Login' : 'Registration'} failed: ${data.detail || 'Unknown error.'}`
                });
            }
        } catch (error) {
            setIsLoading(false);
            setAlert({
                type: 'error',
                message: `${isLogin ? 'Login' : 'Registration'} failed due to network or server error.`
            });
        }
    };

    useEffect(() => {
        if (modelsLoaded && currentStream && webcamVideoRef.current && !isPhotoAlreadyCaptured) {
            // Clear any existing interval before setting a new one
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
            }
            faceDetectionIntervalRef.current = setInterval(detectFaces, 150);
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
        if (open) {
            loadModels().then(startWebcam);
        } else {
            stopWebcam();
        }
    }, [open]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                // onClose={onClose}
                aria-labelledby="customized-dialog-title"
                fullScreen
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {
                        type === "login" ? "Login with Face" : "Register Face"
                    }
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>


                <Components.DialogContent dividers>
                    <div className='flex justify-center items-center'>
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
                            {registerMessage.text && (
                                <p className={`message rounded-lg px-3 py-2 text-sm my-2 ${registerMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                                    registerMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                                        registerMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {registerMessage.text}
                                </p>
                            )}
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className='flex justify-end'>
                        <Button type={`button`} text={type === "login" ? "Login" : "Register Face"} isLoading={isLoading} onClick={() => registerUser()} />
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(FaceRegistration);






// import React, { useEffect, useRef, useState } from 'react';
// import * as faceapi from 'face-api.js';
// import { styled, useTheme } from '@mui/material/styles';
// import Components from '../../muiComponents/components';
// import Button from '../../common/buttons/button';
// import { connect } from 'react-redux';
// import { setAlert } from '../../../redux/commonReducers/commonReducers';
// import CustomIcons from '../../common/icons/CustomIcons';
// import { faceRecognitionAPIBaseURL, faceRecognitionModelURL } from '../../../config/apiConfig/apiConfig';
// import { useNavigate } from 'react-router-dom';
// import { FaceDetection } from '@mediapipe/face_detection';
// import { Camera } from '@mediapipe/camera_utils';
// import { isNative, checkCameraPermission } from '../../../utils/platform';

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//     '& .MuiDialogContent-root': {
//         padding: theme.spacing(2),
//     },
//     '& .MuiDialogActions-root': {
//         padding: theme.spacing(1),
//     },
// }));

// const API_BASE_URL = faceRecognitionAPIBaseURL;
// const modelsPath = faceRecognitionModelURL;

// function FaceRegistration({ setAlert, open, handleClose, employeeId, type = null, setLoginInfo }) {
//     const theme = useTheme();
//     const navigate = useNavigate();

//     const onClose = () => {
//         handleClose(); // Trigger parent to close modal
//         stopWebcam(); // Ensure webcam is stopped
//     };

//     const faceAlignedRef = useRef(false);
//     const countdownIntervalRef = useRef(null);
//     const webcamVideoRef = useRef(null);
//     const capturedPhotoRef = useRef(null);
//     const photoCanvasRef = useRef(null);
//     const detectionCanvasRef = useRef(null);
//     const faceFrameRef = useRef(null);
//     const webcamDisplayRef = useRef(null);
//     const capturedDisplayRef = useRef(null);
//     const countdownActiveRef = useRef(false);
//     const faceDetectionIntervalRef = useRef(null);

//     const [currentStream, setCurrentStream] = useState(null);
//     const [capturedImageDataURL, setCapturedImageDataURL] = useState(null);
//     const [modelsLoaded, setModelsLoaded] = useState(false);
//     const [isPhotoAlreadyCaptured, setIsPhotoAlreadyCaptured] = useState(false); // Manages visibility
//     const [isLoading, setIsLoading] = useState(false);
//     const [registerMessage, setRegisterMessage] = useState({ text: '', type: '' });
//     const [detectionReady, setDetectionReady] = useState(false);


//     const dataURLtoBlob = (dataurl) => {
//         const arr = dataurl.split(',');
//         const mime = arr[0].match(/:(.*?);/)[1];
//         const bstr = atob(arr[1]);
//         let n = bstr.length;
//         const u8arr = new Uint8Array(n); // Corrected typo
//         while (n--) {
//             u8arr[n] = bstr.charCodeAt(n);
//         }
//         return new Blob([u8arr], { type: mime });
//     };

//     const showMessage = (setter, msg, type) => {
//         setter({ text: msg, type });
//     };

//     const clearMessage = (setter) => {
//         setter({ text: '', type: '' });
//     };

//     const loadModels = async () => {
//         try {
//             await faceapi.nets.tinyFaceDetector.load(modelsPath);
//             setModelsLoaded(true);
//             console.log('Face-API models loaded successfully.');
//             // Initial message after models load, before webcam is fully ready
//             showMessage(setRegisterMessage, 'Models loaded. Starting webcam...', 'info');
//         } catch (error) {
//             console.error('Failed to load face-api.js models:', error);
//             showMessage(setRegisterMessage, 'Error loading face detection models. Please refresh.', 'error');
//         }
//     };

//     const handlePlayVideo = async (videoElement) => {
//         try {
//             await videoElement.play();
//         } catch (err) {
//             console.log('Video play error:', err);
//             videoElement.muted = true;
//             try {
//                 await videoElement.play();
//             } catch (err2) {
//                 console.log('Second video play attempt failed:', err2);
//             }
//         }
//     };

//     const detectFaces = async () => {
//         if (isPhotoAlreadyCaptured) {
//             console.log('detectFaces: Photo already captured, skipping detection cycle.');
//             return;
//         }

//         if (!webcamVideoRef.current || webcamVideoRef.current.paused || webcamVideoRef.current.ended || !modelsLoaded) {
//             console.log('detectFaces: Webcam or models not ready.');
//             return;
//         }

//         try {
//             const detection = await faceapi.detectSingleFace(
//                 webcamVideoRef.current,
//                 new faceapi.TinyFaceDetectorOptions()
//             );

//             if (!detection || detection.score < 0.6) {
//                 if (!isPhotoAlreadyCaptured) {
//                     showMessage(setRegisterMessage, 'No face detected. Please stand in front of the camera.', 'info');
//                 }
//                 faceAlignedRef.current = false;
//                 if (faceFrameRef.current) {
//                     faceFrameRef.current.style.borderColor = "#ef4444"; // Red
//                     faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#ef4444");
//                 }
//                 if (countdownIntervalRef.current) {
//                     clearInterval(countdownIntervalRef.current);
//                     countdownIntervalRef.current = null;
//                     countdownActiveRef.current = false;
//                 }
//                 return;
//             }

//             const displaySize = {
//                 width: webcamVideoRef.current.offsetWidth,
//                 height: webcamVideoRef.current.offsetHeight
//             };
//             const resizedDetection = faceapi.resizeResults(detection, displaySize);

//             // Draw detection box
//             if (detectionCanvasRef.current) {
//                 const ctx = detectionCanvasRef.current.getContext('2d');
//                 ctx.clearRect(0, 0, detectionCanvasRef.current.width, detectionCanvasRef.current.height);
//                 faceapi.draw.drawDetections(detectionCanvasRef.current, resizedDetection);
//             }

//             const faceBox = resizedDetection.box;
//             const frameRect = faceFrameRef.current.getBoundingClientRect();
//             const videoRect = webcamVideoRef.current.getBoundingClientRect();

//             const frameX = frameRect.left - videoRect.left;
//             const frameY = frameRect.top - videoRect.top;
//             const frameWidth = frameRect.width;
//             const frameHeight = frameRect.height;

//             const scaleX = webcamVideoRef.current.videoWidth / webcamVideoRef.current.offsetWidth;
//             const scaleY = webcamVideoRef.current.videoHeight / webcamVideoRef.current.offsetHeight;

//             const scaledFaceBox = new faceapi.Rect(
//                 faceBox.x * scaleX,
//                 faceBox.y * scaleY,
//                 faceBox.width * scaleX,
//                 faceBox.height * scaleY
//             );

//             const scaledFrameX = frameX * scaleX;
//             const scaledFrameY = frameY * scaleY;
//             const scaledFrameWidth = frameWidth * scaleX;
//             const scaledFrameHeight = frameHeight * scaleY;

//             // Relaxed margin to allow easier face alignment (especially on phones)
//             const relaxedMarginX = scaledFrameWidth * 0.05; // 5%
//             const relaxedMarginY = scaledFrameHeight * 0.07; // 7%

//             const isWithinFrame =
//                 scaledFaceBox.x + scaledFaceBox.width > scaledFrameX + relaxedMarginX &&
//                 scaledFaceBox.y + scaledFaceBox.height > scaledFrameY + relaxedMarginY &&
//                 scaledFaceBox.x < scaledFrameX + scaledFrameWidth - relaxedMarginX &&
//                 scaledFaceBox.y < scaledFrameY + scaledFrameHeight - relaxedMarginY;

//             if (isWithinFrame) {
//                 faceAlignedRef.current = true;
//                 faceFrameRef.current.style.borderColor = "#22c55e"; // Green
//                 faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#22c55e");

//                 if (!isPhotoAlreadyCaptured && !countdownActiveRef.current) {
//                     countdownActiveRef.current = true;
//                     let countdown = 2;
//                     countdownIntervalRef.current = setInterval(() => {
//                         countdown--;
//                         if (countdown > 0) {
//                         } else {
//                             clearInterval(countdownIntervalRef.current);
//                             countdownIntervalRef.current = null;
//                             countdownActiveRef.current = false;
//                             capturePhoto();
//                         }
//                     }, 1000);
//                 }
//             } else {
//                 faceAlignedRef.current = false;
//                 faceFrameRef.current.style.borderColor = "#ef4444"; // Red
//                 faceFrameRef.current.querySelectorAll('.corner').forEach(c => c.style.borderColor = "#ef4444");

//                 if (countdownIntervalRef.current) {
//                     clearInterval(countdownIntervalRef.current);
//                     countdownIntervalRef.current = null;
//                     countdownActiveRef.current = false;
//                     showMessage(setRegisterMessage, 'Face moved out of alignment. Please re-center.', 'warning');
//                 } else if (!isPhotoAlreadyCaptured) {
//                     showMessage(setRegisterMessage, 'Please position your face within the frame.', 'info');
//                 }
//             }

//         } catch (err) {
//             console.error('Face detection error:', err);
//         }
//     };

//     const onResults = (results) => {
//         if (!results.detections || results.detections.length === 0) {
//             if (!faceAlignedRef.current) return;  // avoid flicker
//             faceAlignedRef.current = false;
//             updateFrameBorder(false);
//             showMessage(setRegisterMessage, 'No face detected.', 'info');
//             return;
//         }

//         const detection = results.detections[0];
//         const box = detection.boundingBox;

//         const canvas = detectionCanvasRef?.current;
//         const frameBox = faceFrameRef?.current;
//         const canvasWidth = canvas?.width;
//         const canvasHeight = canvas?.height;

//         const faceX = (box.xCenter - box.width / 2) * canvasWidth;
//         const faceY = (box.yCenter - box.height / 2) * canvasHeight;
//         const faceWidth = box.width * canvasWidth;
//         const faceHeight = box.height * canvasHeight;

//         const canvasRect = canvas.getBoundingClientRect();
//         const frameRect = frameBox.getBoundingClientRect();
//         const scaleX = canvasWidth / canvasRect.width;
//         const scaleY = canvasHeight / canvasRect.height;

//         const frameX = (frameRect.left - canvasRect.left) * scaleX;
//         const frameY = (frameRect.top - canvasRect.top) * scaleY;
//         const frameWidth = frameRect.width * scaleX;
//         const frameHeight = frameRect.height * scaleY;

//         // Debug draw
//         const ctx = canvas.getContext('2d');
//         ctx.clearRect(0, 0, canvasWidth, canvasHeight);
//         ctx.strokeStyle = 'blue';  // or Tailwind blue-500: '#3b82f6'
//         ctx.lineWidth = 2;
//         ctx.strokeRect(faceX, faceY, faceWidth, faceHeight);


//         // Check alignment with margin
//         const marginX = frameWidth * 0.1;
//         const marginY = frameHeight * 0.1;
//         const isAligned =
//             faceX > frameX - marginX &&
//             faceY > frameY - marginY &&
//             faceX + faceWidth < frameX + frameWidth + marginX &&
//             faceY + faceHeight < frameY + frameHeight + marginY;

//         // 👉 **ONLY change state if value changed**
//         if (isAligned !== faceAlignedRef.current) {
//             faceAlignedRef.current = isAligned;
//             updateFrameBorder(isAligned);

//             if (!isAligned && !isPhotoAlreadyCaptured) {
//                 showMessage(setRegisterMessage, 'Face not aligned in frame. Please re-center.', 'warning');
//             }
//         }

//         // 👉 Start capture only once
//         if (isAligned && !isPhotoAlreadyCaptured && !countdownActiveRef.current) {
//             countdownActiveRef.current = true;
//             let countdown = 2;
//             countdownIntervalRef.current = setInterval(() => {
//                 countdown--;
//                 if (countdown <= 0) {
//                     clearInterval(countdownIntervalRef.current);
//                     countdownIntervalRef.current = null;
//                     countdownActiveRef.current = false;
//                     capturePhoto();
//                 }
//             }, 1000);
//         }
//     };

//     const updateFrameBorder = (aligned) => {
//         if (!faceFrameRef.current) return;
//         faceFrameRef.current.style.borderColor = aligned ? "#22c55e" : "#ef4444";
//         faceFrameRef.current.querySelectorAll('.corner').forEach(c =>
//             c.style.borderColor = aligned ? "#22c55e" : "#ef4444"
//         );
//     };



//     const startWebcam = async () => {
//         clearMessage(setRegisterMessage);
//         setIsPhotoAlreadyCaptured(false);

//         if (webcamDisplayRef.current) webcamDisplayRef.current.classList.remove('hidden');
//         if (capturedDisplayRef.current) capturedDisplayRef.current.classList.add('hidden');

//         if (isNative()) {
//             await checkCameraPermission();
//         }

//         const videoElement = webcamVideoRef.current;

//         const faceDetection = new FaceDetection({
//             locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
//         });

//         faceDetection.setOptions({
//             model: 'short', // faster and smaller
//             minDetectionConfidence: 0.6,
//         });

//         faceDetection.onResults(onResults);

//         const camera = new Camera(videoElement, {
//             onFrame: async () => {
//                 if (!isPhotoAlreadyCaptured) {
//                     await faceDetection.send({ image: videoElement });
//                 }
//             },
//             width: 320,
//             height: 240,
//         });

//         camera.start();
//         setDetectionReady(true);
//     };

//     const stopWebcam = () => {
//         if (countdownIntervalRef.current) {
//             clearInterval(countdownIntervalRef.current);
//             countdownIntervalRef.current = null;
//         }

//         if (faceDetectionIntervalRef.current) {
//             clearInterval(faceDetectionIntervalRef.current);
//             faceDetectionIntervalRef.current = null;
//         }

//         countdownActiveRef.current = false;
//         faceAlignedRef.current = false;

//         clearMessage(setRegisterMessage);
//         setIsPhotoAlreadyCaptured(false);
//     };

//     const capturePhoto = () => {

//         // if (!currentStream) {
//         //     console.log('Capture failed: No current stream');
//         //     showMessage(setRegisterMessage, 'Webcam not active.', 'error');
//         //     return;
//         // }

//         if (!webcamVideoRef.current || webcamVideoRef.current.readyState < 2) {
//             showMessage(setRegisterMessage, 'Webcam not ready yet.', 'error');
//             return;
//         }


//         if (!faceAlignedRef.current) {
//             console.log('Capture failed: Face not aligned at capture moment');
//             showMessage(setRegisterMessage, 'Face moved out of alignment before capture. Please re-center.', 'warning');
//             return;
//         }

//         try {
//             const videoWidth = webcamVideoRef.current.videoWidth;
//             const videoHeight = webcamVideoRef.current.videoHeight;
//             const displayWidth = webcamVideoRef.current.offsetWidth;
//             const displayHeight = webcamVideoRef.current.offsetHeight;

//             const frameRect = faceFrameRef.current.getBoundingClientRect();
//             const videoRect = webcamVideoRef.current.getBoundingClientRect();

//             const frameX_display = frameRect.left - videoRect.left;
//             const frameY_display = frameRect.top - videoRect.top;
//             const frameWidth_display = frameRect.width;
//             const frameHeight_display = frameRect.height;

//             const scaleX = videoWidth / displayWidth;
//             const scaleY = videoHeight / displayHeight;

//             const paddingPercentage = 0.1;

//             const sourceX = Math.max(0, (frameX_display * scaleX) - (frameWidth_display * scaleX * paddingPercentage));
//             const sourceY = Math.max(0, (frameY_display * scaleY) - (frameHeight_display * scaleY * paddingPercentage));
//             const sourceWidth = Math.min(videoWidth - sourceX, (frameWidth_display * scaleX) * (1 + paddingPercentage * 2));
//             const sourceHeight = Math.min(videoHeight - sourceY, (frameHeight_display * scaleY) * (1 + paddingPercentage * 2));

//             photoCanvasRef.current.width = sourceWidth;
//             photoCanvasRef.current.height = sourceHeight;
//             const context = photoCanvasRef.current.getContext('2d');

//             context.drawImage(
//                 webcamVideoRef.current,
//                 sourceX, sourceY, sourceWidth, sourceHeight,
//                 0, 0, photoCanvasRef.current.width, photoCanvasRef.current.height
//             );

//             const dataURL = photoCanvasRef.current.toDataURL('image/jpeg', 0.9);
//             setCapturedImageDataURL(dataURL);
//             if (capturedPhotoRef.current) capturedPhotoRef.current.src = dataURL;

//             // --- VISIBILITY CONTROL ---
//             webcamDisplayRef.current?.classList.add('hidden'); // Hide webcam
//             capturedDisplayRef.current?.classList.remove('hidden'); // Show captured photo

//             setIsPhotoAlreadyCaptured(true); // This state change is key for stopping detection
//             faceAlignedRef.current = false;

//             // Ensure all intervals are stopped after capture
//             if (faceDetectionIntervalRef.current) {
//                 clearInterval(faceDetectionIntervalRef.current);
//                 faceDetectionIntervalRef.current = null;
//             }
//             if (countdownIntervalRef.current) {
//                 clearInterval(countdownIntervalRef.current);
//                 countdownIntervalRef.current = null;
//                 console.log('capturePhoto: Stopped countdown interval.');
//             }
//             countdownActiveRef.current = false;

//             showMessage(setRegisterMessage, 'Face captured successfully! You can now register.', 'success');
//         } catch (err) {
//             console.error('Error capturing photo:', err);
//             showMessage(setRegisterMessage, 'Error capturing photo. Please try again.', 'error');
//         }
//     };

//     const retakePhoto = () => {
//         clearMessage(setRegisterMessage);
//         clearMessage(setRegisterMessage);
//         setCapturedImageDataURL(null);
//         setIsPhotoAlreadyCaptured(false); // This state change is key for restarting detection
//         countdownActiveRef.current = false;

//         // --- VISIBILITY CONTROL ---
//         capturedDisplayRef.current?.classList.add('hidden'); // Hide captured photo
//         webcamDisplayRef.current?.classList.remove('hidden'); // Show webcam

//         startWebcam(); // This will re-initialize the webcam and its state, triggering useEffect to restart detection
//     };

//     const registerUser = async () => {
//         setIsLoading(true);
//         clearMessage(setRegisterMessage);

//         if (!capturedImageDataURL) {
//             setIsLoading(false);
//             showMessage(setRegisterMessage, 'No captured face detected. Please retake or capture a new face.', 'error');
//             return;
//         }

//         const imageBlob = dataURLtoBlob(capturedImageDataURL);
//         const formData = new FormData();

//         const isLogin = type === "login";
//         const fieldName = isLogin ? "file" : "image";
//         const fileName = isLogin ? "login.jpg" : "register.jpg";
//         const apiEndpoint = isLogin ? "/login" : "/register";

//         formData.append('employeeId', employeeId);
//         formData.append(fieldName, imageBlob, fileName);

//         try {
//             const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
//                 method: 'POST',
//                 body: formData,
//             });

//             const data = await response.json();
//             if (response.ok) {
//                 setIsLoading(false);
//                 if (!isLogin) {
//                     setAlert({
//                         open: true,
//                         type: 'success',
//                         message: 'Face registered successfully!'
//                     });
//                     navigate('/dashboard/manageemployees');
//                 } else {
//                     setLoginInfo(data);
//                 }
//                 onClose();
//             } else {
//                 setIsLoading(false);
//                 setAlert({
//                     open: true,
//                     type: 'error',
//                     message: `${isLogin ? 'Login' : 'Registration'} failed: ${data.detail || 'Unknown error.'}`
//                 });
//             }
//         } catch (error) {
//             setIsLoading(false);
//             setAlert({
//                 type: 'error',
//                 message: `${isLogin ? 'Login' : 'Registration'} failed due to network or server error.`
//             });
//         }
//     };

//     useEffect(() => {
//         if (modelsLoaded && currentStream && webcamVideoRef.current && !isPhotoAlreadyCaptured) {
//             // Clear any existing interval before setting a new one
//             if (faceDetectionIntervalRef.current) {
//                 clearInterval(faceDetectionIntervalRef.current);
//             }
//             faceDetectionIntervalRef.current = setInterval(detectFaces, 150);
//         } else {
//             // Stop detection if conditions are not met (e.g., photo captured, stream stopped)
//             if (faceDetectionIntervalRef.current) {
//                 clearInterval(faceDetectionIntervalRef.current);
//                 faceDetectionIntervalRef.current = null;
//             }
//             if (countdownIntervalRef.current) {
//                 clearInterval(countdownIntervalRef.current);
//                 countdownIntervalRef.current = null;
//                 countdownActiveRef.current = false;
//             }
//             // This is important: if detection stops because a photo was captured, reset faceAlignedRef
//             if (isPhotoAlreadyCaptured) {
//                 faceAlignedRef.current = false;
//             }
//         }

//         // Cleanup for this specific effect
//         return () => {
//             if (faceDetectionIntervalRef.current) {
//                 clearInterval(faceDetectionIntervalRef.current);
//                 faceDetectionIntervalRef.current = null;
//             }
//             if (countdownIntervalRef.current) {
//                 clearInterval(countdownIntervalRef.current);
//                 countdownIntervalRef.current = null;
//             }
//             countdownActiveRef.current = false;
//         };
//     }, [modelsLoaded, currentStream, isPhotoAlreadyCaptured]);

//     useEffect(() => {
//         if (open) {
//             loadModels().then(startWebcam);
//         } else {
//             stopWebcam();
//         }
//     }, [open]);

//     return (
//         <React.Fragment>
//             <BootstrapDialog
//                 open={open}
//                 // onClose={onClose}
//                 aria-labelledby="customized-dialog-title"
//                 fullScreen
//             >
//                 <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
//                     {
//                         type === "login" ? "Login with Face" : "Register Face"
//                     }
//                 </Components.DialogTitle>

//                 <Components.IconButton
//                     aria-label="close"
//                     onClick={onClose}
//                     sx={(theme) => ({
//                         position: 'absolute',
//                         right: 8,
//                         top: 8,
//                         color: theme.palette.primary.icon,
//                     })}
//                 >
//                     <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
//                 </Components.IconButton>


//                 <Components.DialogContent dividers>
//                     <div className='flex justify-center items-cente'>
//                         <div className="bg-white w-[300px] max-w-md flex flex-col gap-5 text-center">
//                             <div
//                                 id="webcamDisplay"
//                                 ref={webcamDisplayRef}
//                                 className={`video-container relative rounded-lg overflow-hidden bg-black h-[28rem] ${isPhotoAlreadyCaptured ? 'hidden' : ''}`}
//                             >
//                                 <video
//                                     id="webcamVideo"
//                                     ref={webcamVideoRef}
//                                     autoPlay
//                                     muted
//                                     playsInline
//                                     className="absolute top-0 left-0 w-full h-full object-cover"
//                                 />
//                                 <canvas
//                                     id="detectionCanvas"
//                                     ref={detectionCanvasRef}
//                                     className="absolute top-0 left-0 w-full h-full"
//                                 />
//                                 <div
//                                     className="face-frame absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 md:w-52 h-4/5 md:max-w-[25rem] max-h-[32rem] border-2 border-opacity-80 border-red-500 rounded-xl pointer-events-none z-10 transition-colors"
//                                     ref={faceFrameRef}
//                                 >
//                                     <div className="corner tl absolute top-[-2px] left-[-2px] w-5 h-5 border-4 border-blue-500 border-r-0 border-b-0 rounded-tl-lg"></div>
//                                     <div className="corner tr absolute top-[-2px] right-[-2px] w-5 h-5 border-4 border-blue-500 border-l-0 border-b-0 rounded-tr-lg"></div>
//                                     <div className="corner bl absolute bottom-[-2px] left-[-2px] w-5 h-5 border-4 border-blue-500 border-r-0 border-t-0 rounded-bl-lg"></div>
//                                     <div className="corner br absolute bottom-[-2px] right-[-2px] w-5 h-5 border-4 border-blue-500 border-l-0 border-t-0 rounded-br-lg"></div>
//                                 </div>
//                             </div>

//                             <div
//                                 id="capturedDisplay"
//                                 ref={capturedDisplayRef}
//                                 className={`captured-display relative rounded-lg overflow-hidden shadow h-[28rem] w-full max-w-[500px] mx-auto ${!isPhotoAlreadyCaptured ? 'hidden' : ''
//                                     }`}
//                             >
//                                 <img
//                                     id="capturedPhoto"
//                                     ref={capturedPhotoRef}
//                                     alt="Captured Preview"
//                                     className=" w-full h-full object-cover rounded-lg"
//                                 />

//                                 {/* Retake Button Overlay */}
//                                 <div className='absolute bottom-5 right-2 z-50 bg-white bg-opacity-90 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform'>
//                                     <Components.IconButton
//                                         id="retakeIcon"
//                                         onClick={retakePhoto}
//                                     >
//                                         <CustomIcons iconName="fa-solid fa-rotate-left" css="text-blue-600 w-5 h-5" />
//                                     </Components.IconButton>
//                                 </div>
//                             </div>


//                             <canvas id="photoCanvas" ref={photoCanvasRef} className="hidden"></canvas>
//                             {registerMessage.text && (
//                                 <p className={`message rounded-lg px-3 py-2 text-sm my-2 ${registerMessage.type === 'success' ? 'bg-green-100 text-green-800' :
//                                     registerMessage.type === 'error' ? 'bg-red-100 text-red-800' :
//                                         registerMessage.type === 'info' ? 'bg-blue-100 text-blue-800' :
//                                             'bg-yellow-100 text-yellow-800'
//                                     }`}>
//                                     {registerMessage.text}
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                 </Components.DialogContent>

//                 <Components.DialogActions>
//                     <div className='flex justify-end'>
//                         <Button type={`button`} text={type === "login" ? "Login" : "Register Face"} isLoading={isLoading} onClick={() => registerUser()} />
//                     </div>
//                 </Components.DialogActions>
//             </BootstrapDialog>
//         </React.Fragment>
//     );
// }

// const mapDispatchToProps = {
//     setAlert,
// };

// export default connect(null, mapDispatchToProps)(FaceRegistration);