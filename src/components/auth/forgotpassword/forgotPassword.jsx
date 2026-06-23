import React, { useEffect, useState } from 'react'
import { Controller, useForm } from "react-hook-form";
import Input from '../../common/input/input';
import Button from '../../common/buttons/button';
import { NavLink } from 'react-router-dom';
import { generateResetPasswordLink } from '../../../service/users/usersServices';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import CustomIcons from '../../common/icons/CustomIcons';
import { useTheme } from '@mui/material';

const ForgotPassword = ({ setAlert }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false)
    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
        setError
    } = useForm({
        defaultValues: {
            userName: '',
            email: '',           
        },
    });

    const submit = async (data) => {
        setLoading(true)
        const response = await generateResetPasswordLink(watch("email"), watch("userName"), localStorage.getItem("companyId"))
        if (response.data.status !== 200) {
            setLoading(false)
            setAlert({ open: true, message: response.data.message, type: "error" });
            if (response.data.result && response.data.result.errors) {
                response.data.result.errors.forEach((error) => {
                    const [field, message] = Object.entries(error)[0];
                    setError(field, { type: "manual", message });
                });
            }
        } else {
            setAlert({ open: true, message: response.data.message, type: "success" });
            setLoading(false)
        }
    };

    useEffect(() => {
        document.title = "ResetPassword-TimeSheetsPro"
    }, [])

    return (
        <div className='relative'>
            <div className='flex justify-center items-center px-4 md:px-0 min-h-screen'>
                <div className='shadow-[0_0.25rem_0.875rem_0_rgba(38,43,67,0.16)] p-1 md:p-7 md:w-[28rem] rounded-lg bg-white'>
                    <div className='my-3 text-center'>
                        <p className='text-lg md:text-2xl font-semibold text-[#3b4056] capitalize'>
                            Forgot Pin? 🔒
                        </p>
                        <p className='text-xs md:text-sm mt-2 text-[#676B7B]'>
                            Enter your email and we'll send you instructions to reset your pin
                        </p>
                    </div>
                    <form noValidate onSubmit={handleSubmit(submit)} className='px-3 sm:px-7 py-5 md:p-5'>
                        <div className='grid grid-rows gap-4'>
                            <div>
                                <Controller
                                    name="userName"
                                    control={control}
                                    rules={{
                                        required: "Username is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="User Name"
                                            type="text"
                                            placeholder="Enter user name"
                                            error={errors.userName}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Email"
                                            type="email"
                                            placeholder="Enter your email"
                                            error={errors.email}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div className='mt-0'>
                                <Button type={`submit`} text={`Send reset link`} isLoading={loading} />
                            </div>

                            <div>
                                <NavLink to={`/signin`} style={{ color: theme.palette.primary.main }} className={`flex justify-center items-center gap-3 mt-1`}>
                                    <CustomIcons iconName={'fa-solid fa-arrow-left'} css=' cursor-pointer h-5 w-5' />
                                    <span>
                                        Back to login
                                    </span>
                                </NavLink>
                            </div>

                        </div>
                    </form>
                </div>
                <img
                    alt="mask"
                    src="/images/auth/TSP-Login-BG-2.png"
                    className="absolute -z-10 bottom-0 hidden lg:block w-screen"
                />

            </div>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};
export default connect(null, mapDispatchToProps)(ForgotPassword)