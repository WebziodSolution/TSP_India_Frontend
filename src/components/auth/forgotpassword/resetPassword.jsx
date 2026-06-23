import React, { useEffect, useState } from 'react'
import { Controller, useForm } from "react-hook-form";
import Input from '../../common/input/input';
import Button from '../../common/buttons/button';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { checkValidToken, resetPassword } from '../../../service/users/usersServices';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import CustomIcons from '../../common/icons/CustomIcons';
import { useTheme } from '@mui/material';

const ResetPassword = ({ setAlert }) => {
    const { token } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
        setValue
    } = useForm({
        defaultValues: {
            userId: null,
            companyId: null,
            password: '',
            confirmPassword: '',
        },
    });

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible((prev) => !prev);
    };

    const submit = async (data) => {
        const newData = {
            ...data,
            token: token,
            companyId: localStorage.getItem("companyId")
        }
        const res = await checkValidToken(token)
        if (res.data?.result?.status !== 200) {
            setAlert({ open: true, message: res.data.message, type: "error" })
            navigate("/forgotpassword")
            return
        } else {
            setValue("userId", res.data?.result?.userId?.toString() || null)
        }
        const response = await resetPassword(newData)
        if (response.data.status === 200) {
            // setAlert({ open: true, message: response.data.message, type: "success" })
            navigate("/signin")
        } else {
            setAlert({ open: true, message: response.data.message, type: "error" })
        }
        // if (passwordError.every((row) => row.showError === false)) {
        // } else {
        //     return;
        // }
    };

    const checkValidUrl = async () => {
        const response = await checkValidToken(token)
        if (response.data?.result?.status !== 200) {
            setAlert({ open: true, message: response.data.message, type: "error" })
            navigate("/forgotpin")
        } else {
            setValue("userId", response.data?.result?.userId?.toString() || null)
        }
    }

    useEffect(() => {
        document.title = "ResetPassword-TimeSheetsPro"
        checkValidUrl()
    }, [])

    return (
        <div className='relative'>
            <div className='flex justify-center items-center px-4 md:px-0 min-h-screen'>
                <div className='shadow-[0_0.25rem_0.875rem_0_rgba(38,43,67,0.16)] p-1 md:p-7 md:w-[28rem] rounded-lg bg-white'>
                    <div className='my-3 text-center'>
                        <p className='text-lg md:text-2xl font-semibold text-[#3b4056] capitalize'>
                            Reset Pin 🔒
                        </p>
                        <p className='text-xs md:text-sm mt-2 text-[#676B7B]'>
                            Your new password must be different from previously used pin
                        </p>
                    </div>
                    <form noValidate onSubmit={handleSubmit(submit)} className='px-3 sm:px-7 py-5 md:p-5'>
                        <div className='grid grid-rows gap-4'>
                            <div>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: "Pin is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="New Pin"
                                            type={`${isPasswordVisible ? 'text' : 'password'}`}
                                            placeholder="********"
                                            error={errors.password}
                                            // helperText={errors.password?.message}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                // validatePassword(e.target.value)
                                            }}
                                            endIcon={
                                                <span
                                                    onClick={togglePasswordVisibility}
                                                    style={{ cursor: 'pointer', color: 'white' }}
                                                >
                                                    {isPasswordVisible ? (
                                                        <CustomIcons iconName={'fa-solid fa-eye'} css='cursor-pointer text-black' />
                                                    ) : (
                                                        <CustomIcons iconName={'fa-solid fa-eye-slash'} css='cursor-pointer text-black' />
                                                    )}
                                                </span>
                                            }
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    rules={{
                                        required: "Confirm pin is required",
                                        validate: (value) => {
                                            if (value !== watch('password')) {
                                                return "Confirm pin do not match to pin";
                                            }
                                        }
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Confirm Pin"
                                            type={`${isConfirmPasswordVisible ? 'text' : 'password'}`}
                                            placeholder="********"
                                            error={errors.confirmPassword}
                                            // helperText={errors.confirmPassword?.message}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                            endIcon={
                                                <span
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    style={{ cursor: 'pointer', color: 'white' }}
                                                >
                                                    {isConfirmPasswordVisible ? (
                                                        <CustomIcons iconName={'fa-solid fa-eye'} css='cursor-pointer text-black' />
                                                    ) : (
                                                        <CustomIcons iconName={'fa-solid fa-eye-slash'} css='cursor-pointer text-black' />
                                                    )}
                                                </span>
                                            }
                                        />
                                    )}
                                />
                            </div>

                            {/* <div>
                                {passwordError.map((error, index) => (
                                    <div key={index} className="flex items-center">
                                        <p className="grow text-black text-sm">{error.message}</p>
                                        <p>
                                            {error.showError ? (
                                                <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-red-600' />
                                            ) : (
                                                <CustomIcons iconName={'fa-solid fa-check'} css='cursor-pointer text-green-600' />
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div> */}


                            <div className='mt-0'>
                                <Button type={`submit`} text={`Set new pin`} />
                            </div>

                            <div>
                                <NavLink to={`/signin`} style={{ color: theme.palette.primary.main }} className={` flex justify-center items-center gap-3 mt-1`}>
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

export default connect(null, mapDispatchToProps)(ResetPassword)

// sendLink
//                             ? "images/auth/auth-basic-forgot-password-mask-light.png"