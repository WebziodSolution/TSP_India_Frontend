import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { createLocation, getLocation, updateLocation } from '../../../service/location/locationService';
// import { fetchAllTimeZones } from '../../../service/common/commonService';
import Select from '../../common/select/select';
import CustomIcons from '../../common/icons/CustomIcons';

import { getAllCountry } from '../../../service/country/countryService';
import { getAllStateByCountry } from '../../../service/state/stateService';
// import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import dayjs from 'dayjs';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

// const payScheduleOptions = [
//     { id: 1, title: "Weekly" },
//     { id: 2, title: "Bi-Weekly" },
//     { id: 3, title: "Semi-Monthly" },
//     { id: 4, title: "Monthly" }
// ]

function AddLocationModel({ setAlert, open, handleClose, locationId, companyId, handleGetLocations }) {

    const [loading, setLoading] = useState(false);
    // const [timeZones, setTimeZones] = useState([]);

    const [countryData, setCountryData] = useState([])
    const [stateData, setStateData] = useState([])

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            locationName: "",
            // timeZone: "",
            // timeZoneId: null,
            city: "",
            state: "",
            country: "India",
            address1: "",
            address2: "",
            zipCode: "",
            employeeCount: "",
            companyId: null,
            isActive: 1,
            payPeriod: null,
            payPeriodStart: new Date(),
            payPeriodEnd: new Date(),
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            locationName: "",
            timeZone: "",
            timeZoneId: null,
            city: "",
            state: "",
            country: "India",
            address1: "",
            address2: "",
            zipCode: "",
            employeeCount: "",
            companyId: null,
            isActive: 1,
        });
        handleClose();
    };

    const handleGetAllCountrys = async () => {
        const res = await getAllCountry()
        const data = res?.data?.result?.map((item) => {
            return {
                id: item.id,
                title: item.cntName
            }
        })
        setCountryData(data)
        handleGetAllStatesByCountryId(102);
    }

    const handleGetAllStatesByCountryId = async (id) => {
        const res = await getAllStateByCountry(id)
        const data = res?.data?.result?.map((item) => {
            return {
                ...item,
                id: item.id,
                title: item.stateLong
            }
        })
        setStateData(data)
        if (watch("state")) {
            const selectedState = data?.filter((row) => row?.title === watch("state"))?.[0] || null
            setValue("state", selectedState?.title)
        }
    }

    // const handleFetchAllTimeZones = async () => {
    //     const response = await fetchAllTimeZones()
    //     setTimeZones(response)
    // }

    const handleGetLocation = async () => {
        if (!locationId) return;
        setLoading(true);
        const response = await getLocation(locationId);
        if (response?.data?.status === 200) {
            const locationData = response?.data?.result;
            reset(locationData)
            const selectedState = countryData?.find((row) => row?.title === watch("country")) || null
            await handleGetAllStatesByCountryId(selectedState?.id || 102);
            // const timeZone = timeZones?.find((zone) => zone.zone === locationData?.timeZone);
            // setValue("timeZoneId", timeZone?.id || null);
        }
        setLoading(false);
    }

    const submit = async (data) => {
        const newData = {
            ...data,
            country: "India",
            companyId: companyId,
            payPeriodStart: dayjs(data.payPeriodStart).isValid()
                ? dayjs(data.payPeriodStart).format("DD/MM/YYYY")
                : data.payPeriodStart,
            payPeriodEnd: dayjs(data.payPeriodEnd).isValid()
                ? dayjs(data.payPeriodEnd).format("DD/MM/YYYY")
                : data.payPeriodEnd,
        }
        setLoading(true);
        if (locationId) {
            const response = await updateLocation(locationId, newData);
            if (response?.data?.status === 200) {
                handleGetLocations();
                onClose();
            } else {
                setLoading(false);
                setAlert({ open: true, message: response?.data?.message || "Failed to update location", type: "error" });
            }
        } else {
            const response = await createLocation(newData);
            if (response?.data?.status === 201) {
                handleGetLocations();
                onClose();
            } else {
                setLoading(false);
                setAlert({ open: true, message: response?.data?.message || "Failed to create location", type: "error" });
            }
        }
    }

    useEffect(() => {
        handleGetAllCountrys()
        // handleFetchAllTimeZones()
    }, []);

    useEffect(() => {
        handleGetLocation()
    }, [locationId]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {locationId ? "Update" : "Add"} Location
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

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                            <div>
                                <Controller
                                    name="locationName"
                                    control={control}
                                    rules={{
                                        required: "Location name is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Location Name"
                                            type={`text`}
                                            error={errors.locationName}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="address1"
                                    control={control}
                                    rules={{
                                        required: "Address 1 is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Address 1"
                                            type={`text`}
                                            error={errors.address1}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="address2"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Address 2"
                                            type={`text`}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="country"
                                    control={control}
                                    // rules={{
                                    //     required: "Country is required"
                                    // }}
                                    render={({ field }) => (
                                        <Select
                                            disabled
                                            options={countryData}
                                            label={"Country"}
                                            placeholder="Select country"
                                            value={countryData?.filter((row) => row.id === 102)?.[0]?.id || null}
                                        // onChange={(_, newValue) => {
                                        //     if (newValue?.id) {
                                        //         field.onChange(newValue.title);
                                        //         handleGetAllStatesByCountryId(newValue.id);
                                        //     } else {
                                        //         setValue("country", null);
                                        //     }
                                        // }}
                                        // error={errors?.country}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="state"
                                    control={control}
                                    rules={{
                                        required: "State is required"
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            disabled={stateData?.length === 0}
                                            options={stateData}
                                            label={"State"}
                                            placeholder="Select state"
                                            value={stateData?.filter((row) => row.title === watch("state"))?.[0]?.id || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.title);
                                                } else {
                                                    setValue("state", null);
                                                }
                                            }}
                                            error={errors?.state}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="city"
                                    control={control}
                                    rules={{
                                        required: "City is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="City"
                                            type={`text`}
                                            error={errors.city}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="zipCode"
                                    control={control}
                                    rules={{
                                        required: "Zip Code is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Zip Code"
                                            type={`text`}
                                            error={errors.zipCode}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="employeeCount"
                                    control={control}
                                    rules={{
                                        required: "Employee Count is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Employee Count"
                                            type={`text`}
                                            error={errors.employeeCount}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {/* <div className="col-span-2">
                                <Controller
                                    name="timeZone"
                                    control={control}
                                    rules={{
                                        required: "TimeZone is required",
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            options={timeZones}
                                            label={"TimeZone"}
                                            placeholder="Select timezone"
                                            error={errors.timeZone}
                                            value={watch("timeZoneId") || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    setValue("timeZoneId", newValue.id);
                                                    setValue("timeZone", newValue.zone);
                                                } else {
                                                    field.onChange(null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div> */}
                        </div>

                        {/* <div class="my-4 border border-gray-200"></div> */}

                        {/* <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                            <div>
                                <Controller
                                    name="payPeriod"
                                    control={control}
                                    rules={{
                                        required: "Pay period is required"
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            options={payScheduleOptions}
                                            label={"Pay Period"}
                                            placeholder="Select pay period"
                                            value={parseInt(watch("payPeriod")) || null}
                                            onChange={(_, newValue) => {
                                                if (newValue?.id) {
                                                    field.onChange(newValue.id);
                                                } else {
                                                    setValue("payPeriod", null);
                                                }
                                            }}
                                            error={errors?.payPeriod}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <DatePickerComponent setValue={setValue} control={control} name='payPeriodStart' label={`Period Start Date`} minDate={null} maxDate={new Date()} />
                            </div>
                            <div>
                                <DatePickerComponent setValue={setValue} control={control} name='payPeriodEnd' label={`Period End Date`} minDate={watch("payPeriodStart")} maxDate={new Date()} />
                            </div>
                        </div> */}
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={locationId ? "Update" : "Submit"} isLoading={loading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddLocationModel)