import { NavLink } from "react-router-dom"
import CustomIcons from "../../../../common/icons/CustomIcons"
import { useTheme } from "@mui/material";
import TimeSelector from "../../../../common/timeSelector/timeSelector";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { getAutoTimeInAfterHours, updateAutoTimeInAfterHours } from "../../../../../service/companyDetails/companyDetailsService";
import Button from "../../../../common/buttons/button";
import { setAlert } from "../../../../../redux/commonReducers/commonReducers";
import { connect } from "react-redux";

const AutoClockIn = ({ setAlert }) => {
    const theme = useTheme();
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const [timeInAfterHours, setTimeInAfterHours] = useState('');
    const [timeInAfterMinutes, setTimeInAfterMinutes] = useState('');

    const {
        handleSubmit,
        control,
        setValue,
    } = useForm({
        defaultValues: {
            timeInAfterHours: "",
            timeInAfterMinutes: "",
        },
    });

    const submit = async (data) => {
        const formattedAutoTime =
            `${String(timeInAfterHours).padStart(2, '0')}:${String(timeInAfterMinutes).padStart(2, '0')}`;

        const payload = {
            time: formattedAutoTime,
        };

        if (userInfo?.companyId) {
            const response = await updateAutoTimeInAfterHours(userInfo?.companyId, payload)
            if (response.data.status !== 200) {
                setAlert({
                    open: true,
                    message: "Fail to updated auto clock-in time",
                    type: "error",
                })
            } else {
                setAlert({
                    open: true,
                    message: "Auto clock-in time updated successfully",
                    type: "success",
                })
            }
        }
    }

    const handleGetAutoTimeInAfterHours = async () => {
        if (userInfo?.companyId) {
            const response = await getAutoTimeInAfterHours(userInfo?.companyId)
            if (response.data.status === 200) {
                const result = response.data.result;
                if (result) {
                    const [hours, minutes] = result?.split(":");

                    setValue("timeInAfterHours", parseInt(hours));
                    setValue("timeInAfterMinutes", parseInt(minutes));

                    setTimeInAfterHours(parseInt(hours));
                    setTimeInAfterMinutes(parseInt(minutes));
                }

            }
        }
    }

    useEffect(() => {
        handleGetAutoTimeInAfterHours()
    }, [])

    return (
        <div className='px-4 lg:px-0'>
            <div className='mb-4 w-60'>
                <NavLink to={'/dashboard/automationrules'}>
                    <div className='flex justify-start items-center gap-3'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-arrow-left'} css='cursor-pointer h-4 w-4' />
                        </div>
                        <p className='text-md capitalize'>Back to automation rules</p>
                    </div>
                </NavLink>
            </div>

            <div className='border rounded-lg bg-white w-screen lg:w-full p-4'>
                <div className='grow mb-4'>
                    <h2 className='text-lg font-semibold'>Auto Clock In</h2>
                    <p className='text-gray-600'>
                        Configure auto clock in settings.
                    </p>
                </div>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <div>
                        <Controller
                            name="timeInAfterHours"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <Controller
                                    name="timeInAfterMinutes"
                                    control={control}
                                    defaultValue=""
                                    render={({ field: fieldMinutes }) => (
                                        <TimeSelector
                                            hours={field.value}
                                            minutes={fieldMinutes.value}
                                            onChangeHours={(val) => {
                                                field.onChange(val);
                                                setTimeInAfterHours(val);
                                            }}
                                            onChangeMinutes={(val) => {
                                                fieldMinutes.onChange(val);
                                                setTimeInAfterMinutes(val);
                                            }}
                                        />
                                    )}
                                />
                            )}
                        />
                    </div>
                    <div className='flex justify-end mt-4'>
                        <div className="w-20">
                            <Button type={`submit`} text={"Submit"} />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AutoClockIn)