import CustomIcons from '../../../common/icons/CustomIcons'
import { useTheme } from '@mui/material';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const AutomationRules = () => {
    const theme = useTheme();

    useEffect(() => {
        document.title = "Automation Rules - Calculate Salary";
    }, [])
    return (
        <>
            <div className='px-4 lg:px-0'>
                <div className='border rounded-lg bg-white w-screen lg:w-full p-4'>
                    <div className='p-4 border border-gray-300 rounded-lg flex justify-start items-center gap-4 mb-4'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-clock'} css='cursor-pointer h-6 w-6' />
                        </div>
                        <div className='grow'>
                            <h2 className='text-lg font-semibold'>Overtime Rules</h2>
                            <p className='text-gray-600'>
                                Automate Overtime for employees who work beyond their scheduled hours.
                            </p>
                        </div>
                        <div>
                            <NavLink to={'/dashboard/automationrules/overtimerules'}>
                                <div className='flex justify-center items-center gap-2'>
                                    <p>
                                        <span style={{ color: theme.palette.primary.main }} className='font-semibold'>View All</span>
                                    </p>
                                    <div>
                                        <CustomIcons iconName={'fa-solid fa-angle-right'} css='cursor-pointer text-gray-500 h-4 w-4' />
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    </div>

                    <div className='p-4 border border-gray-300 rounded-lg flex justify-start items-center gap-4 mb-4'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-calendar-days'} css='cursor-pointer h-6 w-6' />
                        </div>
                        <div className='grow'>
                            <h2 className='text-lg font-semibold'>Weekly Holidays</h2>
                            <p className='text-gray-600'>
                                Configure & manage weekly holidays.
                            </p>
                        </div>
                        <div>
                            <NavLink to={'/dashboard/automationrules/week-off/templates'}>
                                <div className='flex justify-center items-center gap-2'>
                                    <p>
                                        <span style={{ color: theme.palette.primary.main }} className='font-semibold'>View All</span>
                                    </p>
                                    <div>
                                        <CustomIcons iconName={'fa-solid fa-angle-right'} css='cursor-pointer text-gray-500 h-4 w-4' />
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    </div>

                    <div className='p-4 border border-gray-300 rounded-lg flex justify-start items-center gap-4 mb-4'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-champagne-glasses'} css='cursor-pointer h-6 w-6' />
                        </div>
                        <div className='grow'>
                            <h2 className='text-lg font-semibold'>Holidays Template</h2>
                            <p className='text-gray-600'>
                                Configure & manage holidays templates.
                            </p>
                        </div>
                        <div>
                            <NavLink to={'/dashboard/automationrules/holidays/templates'}>
                                <div className='flex justify-center items-center gap-2'>
                                    <p>
                                        <span style={{ color: theme.palette.primary.main }} className='font-semibold'>View All</span>
                                    </p>
                                    <div>
                                        <CustomIcons iconName={'fa-solid fa-angle-right'} css='cursor-pointer text-gray-500 h-4 w-4' />
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    </div>

                    <div className='p-4 border border-gray-300 rounded-lg flex justify-start items-center gap-4 mb-4'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-person-walking-arrow-right'} css='cursor-pointer h-6 w-6' />
                        </div>
                        <div className='grow'>
                            <h2 className='text-lg font-semibold'>Late Entry Rules</h2>
                            <p className='text-gray-600'>
                                Automate late find for employees who are comming late to work.
                            </p>
                        </div>
                        <div>
                            <NavLink to={'/dashboard/automationrules/late-entry'}>
                                <div className='flex justify-center items-center gap-2'>
                                    <p>
                                        <span style={{ color: theme.palette.primary.main }} className='font-semibold'>View All</span>
                                    </p>
                                    <div>
                                        <CustomIcons iconName={'fa-solid fa-angle-right'} css='cursor-pointer text-gray-500 h-4 w-4' />
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    </div>

                    <div className='p-4 border border-gray-300 rounded-lg flex justify-start items-center gap-4 mb-4'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-person-walking-arrow-right'} css='cursor-pointer h-6 w-6 scale-x-[-1]' />
                        </div>
                        <div className='grow'>
                            <h2 className='text-lg font-semibold'>Early Exit Rules</h2>
                            <p className='text-gray-600'>
                                Automate early exit find for employees who are leaving early from work.
                            </p>
                        </div>
                        <div>
                            <NavLink to={'/dashboard/automationrules/early-exit'}>
                                <div className='flex justify-center items-center gap-2'>
                                    <p>
                                        <span style={{ color: theme.palette.primary.main }} className='font-semibold'>View All</span>
                                    </p>
                                    <div>
                                        <CustomIcons iconName={'fa-solid fa-angle-right'} css='cursor-pointer text-gray-500 h-4 w-4' />
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    </div>

                    <div className='p-4 border border-gray-300 rounded-lg flex justify-start items-center gap-4 mb-4'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-hourglass'} css='cursor-pointer h-6 w-6' />
                        </div>
                        <div className='grow'>
                            <h2 className='text-lg font-semibold'>Auto Clock-In After Hours</h2>
                            <p className='text-gray-600'>
                                Define the maximum allowed gap after shift end for automatic clock-in on the next day.
                            </p>
                        </div>
                        <div>
                            <NavLink to={'/dashboard/automationrules/auto-clockin'}>
                                <div className='flex justify-center items-center gap-2'>
                                    <p>
                                        <span style={{ color: theme.palette.primary.main }} className='font-semibold'>View</span>
                                    </p>
                                    <div>
                                        <CustomIcons iconName={'fa-solid fa-angle-right'} css='cursor-pointer text-gray-500 h-4 w-4' />
                                    </div>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AutomationRules