import React, { useEffect, useState, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { Tooltip, useTheme } from '@mui/material';

import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import CustomIcons from '../../common/icons/CustomIcons';
import {
    GoogleMap,
    DrawingManager,
    useJsApiLoader,
    Polygon,
    Marker
} from '@react-google-maps/api';
import { googleMapAPIKey } from '../../../config/apiConfig/apiConfig';
import { searchLocationDetails } from '../../../service/common/googleMapService';
import { createGeofences, getGeofencesByExternalId, updateGeofences, deleteGeofence } from '../../../service/common/radarService';
import { updateLocation } from '../../../service/location/locationService';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import AlertDialog from '../../common/alertDialog/alertDialog';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const containerStyle = {
    width: "100%",
    height: "400px"
};

const center = {
    lat: 37.7749,
    lng: -122.4194
};

const AddGeofences = ({ setAlert, open, handleClose, selectedLocationRow, companyId, handleGetLocations }) => {
    const theme = useTheme();   
    const [loading, setLoading] = useState(false)

    const [polygons, setPolygons] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const drawingManagerRef = useRef(null);
    const mapRef = useRef(null);
    const polygonRefs = useRef(new Map());
    const [geofenceId, setGeofenceId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [polygonId, setPolygonId] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: googleMapAPIKey,
        libraries: ['drawing']
    });

    const handleOpenDialog = (id) => {
        setPolygonId(id);
        setDialog({
            open: true,
            title: "Delete Geofence",
            message: "Are you sure! Do you want to delete this geofence?",
            actionButtonText: "Delete",
        })
    }

    const handleCloseDialog = () => {
        setPolygonId(null);
        setDialog({
            open: false,
            title: "",
            message: "",
            actionButtonText: "",
        })
    }

    const onClose = () => {
        handleClose();
        setPolygons([])
        setSelectedLocation(null)
        setIsDrawing(false)
        drawingManagerRef.current = null;
        mapRef.current = null;
    };

    const handleFormSearch = async () => {
        if (
            selectedLocationRow?.address1 &&
            selectedLocationRow?.city &&
            selectedLocationRow?.state &&
            selectedLocationRow?.country &&
            selectedLocationRow?.zipCode &&
            open
        ) {
            if (selectedLocationRow?.geofenceId) {
                setGeofenceId(selectedLocationRow?.geofenceId)
            }
            const fullAddress = `${selectedLocationRow.address1}, ${selectedLocationRow.city}, ${selectedLocationRow.state},${selectedLocationRow?.zipCode}, ${selectedLocationRow.country}`;
            const response = await searchLocationDetails(fullAddress);
            if (response.status === "OK") {
                const location = response.results[0].geometry.location;
                setSelectedLocation({
                    lat: location.lat,
                    lng: location.lng
                });
            }
        }

        if (selectedLocationRow?.externalId) {
            const res = await getGeofencesByExternalId(selectedLocationRow.externalId);
            const geofencePolygons = [];

            res?.geofences?.forEach((geo) => {
                if (geo.geometry?.type === 'Polygon' && Array.isArray(geo.geometry.coordinates)) {
                    const polygonCoordinates = geo.geometry.coordinates[0].map(([lng, lat]) => ({
                        lat,
                        lng
                    }));

                    geofencePolygons.push({
                        id: geo._id,
                        path: polygonCoordinates,
                        fromRadar: true,
                        description: geo.description || '',
                        tag: geo.tag || '',
                    });
                }
            });
            setPolygons(geofencePolygons);

            if (geofencePolygons.length > 0 && geofencePolygons[0].path.length > 0) {
                setSelectedLocation(geofencePolygons[0].path[0]);
            }
        }
    };

    const onPolygonComplete = (polygon) => {
        const path = polygon.getPath();
        const coordinates = [];

        for (let i = 0; i < path.getLength(); i++) {
            coordinates.push({
                lat: path.getAt(i).lat(),
                lng: path.getAt(i).lng()
            });
        }

        // Ensure polygon is closed
        if (coordinates.length > 0 &&
            (coordinates[0].lat !== coordinates[coordinates.length - 1].lat ||
                coordinates[0].lng !== coordinates[coordinates.length - 1].lng)) {
            coordinates.push({ ...coordinates[0] });
        }

        const newPolygon = {
            id: `poly-${Date.now()}`,
            path: coordinates,
            tag: 'restricted',
            description: 'Geofence area',
            fromRadar: false
        };

        setPolygons(prev => [...prev, newPolygon]);
        polygon.setMap(null);

        if (drawingManagerRef.current) {
            drawingManagerRef.current.setDrawingMode(null);
        }
        setIsDrawing(false);
    };

    const handlePolygonEdit = useCallback((polygonId) => {
        const polygonInstance = polygonRefs.current.get(polygonId);

        if (!polygonInstance || typeof polygonInstance.getPath !== 'function') {
            console.error('Invalid polygon instance or getPath not available');
            return;
        }

        try {
            const path = polygonInstance.getPath();
            const coordinates = [];

            for (let i = 0; i < path.getLength(); i++) {
                const latLng = path.getAt(i);
                coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
            }

            setPolygons(prev => prev.map(poly => {
                const currentPolyId = poly.id || `poly-${JSON.stringify(poly.path)}`;
                return currentPolyId === polygonId ? { ...poly, path: coordinates } : poly;
            }));
        } catch (error) {
            console.error('Error handling polygon edit:', error);
        }
    }, []);

    const toggleDrawingMode = () => {
        if (!isDrawing && polygons?.length === 0) {
            setIsDrawing(true); // Enable drawing
        } else {
            // Manually cancel drawing if user clicks cancel
            if (drawingManagerRef.current) {
                drawingManagerRef.current.setDrawingMode(null);
                drawingManagerRef.current = null;
            }
            setIsDrawing(false);
        }
    };

    const handleMapClick = (e) => {
        if (!isDrawing) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSelectedLocation({ lat, lng });
        }
    };

    const deletePolygon = () => {
        const polygonInstance = polygonRefs.current.get(polygonId);

        if (polygonInstance && typeof polygonInstance.setMap === 'function') {
            polygonInstance.setMap(null);
        }

        polygonRefs.current.delete(polygonId);
        setPolygons(prev => prev.filter(poly => {
            const currentPolyId = poly.id || `poly-${JSON.stringify(poly.path)}`;
            return currentPolyId !== polygonId;
        }));
        if (geofenceId) {
            deleteGeofence(geofenceId)
                .then(async () => {
                    setLoading(true);
                    const responseData = {
                        ...selectedLocationRow,
                        geofenceId: null,
                        externalId: null
                    }
                    if (selectedLocationRow?.id) {
                        const res = await updateLocation(selectedLocationRow?.id, responseData)
                        if (res.data.status === 200) {
                            handleGetLocations()
                        }
                    }
                    setAlert({ open: true, message: "Geofence deleted successfully", type: "success" });
                    setGeofenceId(null);
                    setLoading(false)
                    handleGetLocations()
                })
                .catch((error) => {
                    setAlert({ open: true, message: "Failed to delete geofence", type: "error" });
                });
        }
        handleCloseDialog();

    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // if (!polygons.length) return setAlert({ open: true, message: "Geofence is required", type: "error" });

            const polygon = polygons[0];
            if (polygon) {
                const coordinates = polygon?.path?.map(coord => [coord.lng, coord.lat]);
                const first = coordinates[0];
                const last = coordinates[coordinates.length - 1];

                if (first[0] !== last[0] || first[1] !== last[1]) {
                    coordinates.push(first);
                }
                const payload = {
                    description: polygon.description || 'User drawn polygon',
                    type: 'polygon',
                    coordinates,
                    tag: polygon.tag || 'restricted',
                    externalId: `timesheetspro_${companyId}_${selectedLocationRow?.id}`
                };

                if (selectedLocationRow?.geofenceId) {
                    const res = await updateGeofences(selectedLocationRow?.geofenceId, payload)
                    if (res?.meta?.code === 200) {
                        handleGetLocations()
                        setAlert({ open: true, message: "Geofence updated successfully", type: "success" })
                        setLoading(false)
                        onClose()
                        return
                    }
                } else {
                    const response = await createGeofences(payload);
                    if (response?.meta?.code === 200) {
                        const responseData = {
                            ...selectedLocationRow,
                            geofenceId: response?.geofence?._id,
                            externalId: response?.geofence?.externalId
                        }
                        if (selectedLocationRow?.id) {
                            const res = await updateLocation(selectedLocationRow?.id, responseData)
                            if (res.data.status === 200) {
                                handleGetLocations()
                                setAlert({ open: true, message: "Geofence created successfully", type: "success" })
                                setLoading(false)
                                onClose()
                            } else {
                                setAlert({ open: true, message: "Fail to create geofence", type: "error" })
                            }
                        }
                    }
                }
            } else {
                setAlert({ open: true, message: "Please draw a geofence before submitting", type: "error" });
            }
        } catch (error) {
            console.error("Geofence submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleFormSearch()
    }, [open])

    if (!isLoaded) return;

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                // fullWidth                
                // maxWidth='lg'
                fullScreen
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {selectedLocationRow?.geofenceId ? "Update" : "Create"} Geofences
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <Components.DialogContent dividers>
                    <div className="flex justify-start items-start gap-4">
                        <div className="w-[40rem]">
                            <div>

                                <div className="flex justify-end my-3 mr-5">
                                    {
                                        !polygons?.length > 0 ? (
                                            <Tooltip placement="bottom" arrow title="Add Geofence">
                                                <div style={{ backgroundColor: theme.palette.primary.main }} className={`p-2 rounded-full text-white flex justify-center cursor-pointer`}
                                                    onClick={toggleDrawingMode}
                                                >
                                                    <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer h-4 w-4' />
                                                </div>
                                            </Tooltip>
                                        ) : null
                                    }
                                </div>

                                <table className="w-[40rem] border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="border-b border-gray-300">
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Tag</th>
                                            <th className="px-4 py-2 text-left">Points Count</th>
                                            <th className="px-4 py-2 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    {
                                        polygons?.length > 0 ? (
                                            <tbody>
                                                {polygons?.map((polygon, index) => (
                                                    <tr key={index} className="border-b border-gray-300">
                                                        <td className="px-4 py-2">{index + 1}</td>
                                                        <td className="px-4 py-2">{polygon.tag || '-'}</td>
                                                        <td className="px-4 py-2">{polygon.path?.length}</td>
                                                        <td className="px-4 py-2">
                                                            <div
                                                                className="h-8 w-8 flex justify-center items-center bg-red-600 cursor-pointer rounded-full text-white"
                                                                onClick={() => handleOpenDialog(polygon.id)}
                                                            >
                                                                <CustomIcons iconName="fa-solid fa-trash" css="cursor-pointer" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        ) :
                                            <tbody>
                                                <tr style={{ color: theme.palette.primary.text.main, }} className='text-center text-red-500 font-semibold capitalize h-10'>
                                                    <td colSpan={4}> No polygons found</td>
                                                </tr>
                                            </tbody>
                                    }
                                </table>

                            </div>
                        </div>

                        <div className="w-full h-full z-50">
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={selectedLocation || center}
                                zoom={17}
                                onClick={handleMapClick}
                                onLoad={(map) => {
                                    mapRef.current = map;
                                }}
                            >
                                {selectedLocation && typeof selectedLocation.lat === 'number' && typeof selectedLocation.lng === 'number' && (
                                    <Marker
                                        position={selectedLocation || center}
                                        icon={{
                                            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                            scaledSize: new window.google.maps.Size(32, 32)
                                        }}
                                    />
                                )}

                                {isDrawing && (
                                    <DrawingManager
                                        onPolygonComplete={onPolygonComplete}
                                        options={{
                                            drawingControl: false,
                                            polygonOptions: {
                                                fillColor: '#2196F3',
                                                fillOpacity: 0.5,
                                                strokeWeight: 2,
                                                clickable: true,
                                                editable: true,
                                                zIndex: 1,
                                            },
                                        }}
                                        onLoad={(drawingManager) => {
                                            drawingManagerRef.current = drawingManager;
                                            drawingManager.setDrawingMode('polygon');
                                        }}
                                        onUnmount={() => {
                                            drawingManagerRef.current = null;
                                        }}
                                    />
                                )}
                            
                                {polygons?.map((polygon) => {
                                    const polygonId = polygon.id || `poly-${JSON.stringify(polygon.path)}`;
                                    return (
                                        <Polygon
                                            key={polygonId}
                                            onLoad={(instance) => polygonRefs.current.set(polygonId, instance)}
                                            onUnmount={() => polygonRefs.current.delete(polygonId)}
                                            path={polygon.path}
                                            options={{
                                                fillColor: '#2196F3',
                                                fillOpacity: 0.5,
                                                strokeWeight: 2,
                                                editable: true,
                                                draggable: true
                                            }}
                                            onDragEnd={() => handlePolygonEdit(polygonId)}
                                            onMouseUp={() => handlePolygonEdit(polygonId)}
                                        />
                                    );
                                })}
                            </GoogleMap>
                        </div>
                    </div>
                </Components.DialogContent>

                <Components.DialogActions>
                    <div className='flex justify-end'>
                        <Button type={`button`} text={selectedLocationRow?.geofenceId ? "Update Geofences" : "Create Geofences"} disabled={polygons?.length === 0} isLoading={loading} onClick={() => handleSubmit()} />
                    </div>
                </Components.DialogActions>

            </BootstrapDialog>
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={deletePolygon} handleClose={handleCloseDialog} note="If you delete this geofence then all employee which is work on this location they can not do clock-in-out or login from this location." />
        </React.Fragment>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddGeofences)