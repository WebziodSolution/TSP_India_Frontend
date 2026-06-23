import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { getAllActions } from '../../../../service/actions/actionsService';
import Checkbox from '../../../common/checkBox/checkbox';
import { handleSetTitle, setAlert } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import { createRole, getAllActionsByRole, getRole, updateRole } from '../../../../service/roles/roleService';
import Input from '../../../common/input/input';
import Button from '../../../common/buttons/button';
import { useParams, useNavigate } from 'react-router-dom';
import { createEmployeeRole, getAllEmployeeActionsByRole, getAllRoleActions, getEmployeeRole, updateEmployeeRole } from '../../../../service/companyEmployeeRole/companyEmployeeRoleService';
import { useTheme } from '@mui/material';
import CustomIcons from '../../../common/icons/CustomIcons';
import Components from '../../../muiComponents/components';

const MODULE_DESCRIPTIONS = {
    "Manage Company": "Configure core company details.",
    "Manage Employees": "Centralized hub for onboarding and personal records.",
    "Manage Shifts": "Create and manage work schedules, rotating shifts.",
    "User": "Administrative control over system access and user login credentials.",
    "Manage Roles": "Define access control levels and assign functional permissions to staff.",
    "Manage Departments": "Organize your workforce into functional units to streamline reporting.",
    "Salary Statement": "Generate and manage payroll summaries and individual earnings statements.",
    "Clock-In-Out": "Monitor real-time attendance tracking and daily punch-in/out logs.",
    "Overtime Rules": "Define policy-driven thresholds and multipliers for additional working hours.",
    "Weekly Holidays": "Define and manage recurring weekly rest days to ensure accurate attendance and payroll calculations.",
    "Holidays Template": "Create standardized holiday calendars to quickly apply public or company-specific holidays across departments.",
    "Late Entry Rules": "Configure grace periods and penalty thresholds for employees arriving after the scheduled start time.",
    "Early Exit Rules": "Set policy-driven parameters for employees departing before the completion of their scheduled shift."
};

const AddRoles = ({ setAlert, handleSetTitle }) => {
    const theme = useTheme()

    const { id } = useParams();
    const navigate = useNavigate();
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))

    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            roleName: '',
            rolesActions: {
                functionalities: []
            }
        },
    });

    const { fields: functionalities, replace } = useFieldArray({
        control,
        name: 'functionalities',
    });

    const handleCheckboxChange = (funcIndex, moduleIndex, actionId, checked) => {
        const functionalities = watch('functionalities');

        const updatedModules = functionalities[funcIndex].modules.map((module, index) => {
            if (index === moduleIndex) {
                const updatedActions = checked
                    ? [...module.roleAssignedActions, actionId]
                    : module.roleAssignedActions.filter((id) => id !== actionId);

                return {
                    ...module,
                    roleAssignedActions: updatedActions,
                };
            }
            return module;
        });

        const updatedFunctionalities = functionalities?.map((func, index) => {
            if (index === funcIndex) {
                return {
                    ...func,
                    modules: updatedModules,
                };
            }
            return func;
        });

        setValue('functionalities', updatedFunctionalities);
    };

    const handleCheckAll = (checked) => {
        const updatedFunctionalities = watch('functionalities')?.map((func) => ({
            ...func,
            modules: func.modules.map((module) => ({
                ...module,
                roleAssignedActions: checked ? [...module.moduleAssignedActions] : [],
            })),
        }));

        setValue('functionalities', updatedFunctionalities);
    };

    const handleCheckAllFunctionalitiesModules = (funcIndex, checked) => {
        const updatedFunctionalities = [...watch('functionalities')];

        const modules = updatedFunctionalities[funcIndex]?.modules || [];

        modules.forEach((module) => {
            if (checked) {
                module.roleAssignedActions = [...new Set([...module.moduleAssignedActions])];
            } else {
                module.roleAssignedActions = [];
            }
        });
        setValue('functionalities', updatedFunctionalities);
    };

    const handleCheckAllModulesAction = (checked, actionId) => {
        const updatedFunctionalities = watch('functionalities').map((func) => ({
            ...func,
            modules: func.modules.map((module) => {
                const isActionAssignable = module.moduleAssignedActions.includes(actionId);
                return {
                    ...module,
                    roleAssignedActions: checked
                        ? isActionAssignable
                            ? [...new Set([...module.roleAssignedActions, actionId])] // Add actionId if assignable
                            : module.roleAssignedActions // No change if actionId is not assignable
                        : module.roleAssignedActions.filter((id) => id !== actionId), // Remove actionId if unchecked
                };
            }),
        }));

        setValue('functionalities', updatedFunctionalities);
    };

    const handleGetAllActions = async () => {
        if (userInfo?.employeeId && userInfo?.companyId) {
            const res = await getAllRoleActions();
            setHeaders(res.data.result);
        } else {
            const res = await getAllActions();
            setHeaders(res.data.result);
        }
    }

    const attachDescriptions = (functionalities) => {
        return functionalities.map(func => ({
            ...func,
            modules: func.modules.map(module => ({
                ...module,
                // Use the map, or fallback to existing description, or empty string
                moduleDescription: MODULE_DESCRIPTIONS[module.moduleName] || module.moduleDescription || ""
            }))
        }));
    };

    const handleGetAllActionsByRole = async () => {
        if (id) {
            if (!userInfo?.companyId && !userInfo?.employeeId) {
                const res = await getRole(id);
                setValue('roleName', res.data?.result?.role?.roleName);
                replace(attachDescriptions(res.data?.result?.role?.rolesActions?.functionalities?.filter((func) => func.functionalityName !== "Users")));
            } else {
                const res = await getEmployeeRole(id);
                const data = res.data?.result?.rolesActions?.functionalities?.filter((func) => func.functionalityName !== "Users");
                setValue('roleName', res.data?.result?.roleName);
                replace(attachDescriptions(data));
            }
        } else {
            const res = (!userInfo?.companyId && !userInfo?.employeeId)
                ? await getAllActionsByRole(0)
                : await getAllEmployeeActionsByRole(0);

            replace(attachDescriptions(res.data?.result?.functionalities?.filter((func) => func.functionalityName !== "Users")));
        }
    }

    const handleSaveRole = async (data) => {
        setLoading(true);
        delete data.rolesActions
        if (id) {
            const newData = {
                roleName: data.roleName,
                roleId: id,
                companyId: userInfo?.companyId,
                rolesActions: {
                    functionalities: data.functionalities
                }
            }
            if (userInfo?.employeeId && userInfo?.companyId) {
                const res = await updateEmployeeRole(id, newData);
                if (res.data.status === 200) {
                    setLoading(false);

                    navigate('/dashboard/manageroles');
                } else {
                    setLoading(false);
                    setAlert({ open: true, message: res.data.message, type: 'error' });
                }
            } else {
                const res = await updateRole(id, newData);
                if (res.data.status === 200) {
                    setLoading(false);
                    navigate('/dashboard/manageroles');
                } else {
                    setLoading(false);
                    setAlert({ open: true, message: res.data.message, type: 'error' });
                }
            }
        } else {
            const newData = {
                roleName: data.roleName,
                companyId: userInfo?.companyId,
                rolesActions: {
                    functionalities: data.functionalities
                }
            }
            if (userInfo?.employeeId && userInfo?.companyId) {
                const res = await createEmployeeRole(newData);
                if (res.data.status === 201) {
                    // setAlert({ open: true, message: res.data.message, type: 'success' });
                    setLoading(false);
                    navigate('/dashboard/manageroles');
                } else {
                    setLoading(false);
                    setAlert({ open: true, message: res.data.message, type: 'error' });
                }
            } else {
                const res = await createRole(newData);
                if (res.data.status === 201) {
                    setLoading(false);
                    navigate('/dashboard/manageroles');
                } else {
                    setLoading(false);
                    setAlert({ open: true, message: res.data.message, type: 'error' });
                }
            }
        }
    }

    useEffect(() => {
        handleSetTitle("Manage Roles");
        document.title = "Add Role - Calculate Salary";
        handleGetAllActions();
        handleGetAllActionsByRole();
    }, []);

    return (
        <div className='px-3 lg:px-0'>
            <form onSubmit={handleSubmit(handleSaveRole)}>
                <div className='my-5 md:w-96'>
                    <Controller
                        name="roleName"
                        control={control}
                        rules={{
                            required: "Role name is required",
                        }}
                        render={({ field }) => (
                            <Input
                                {...field}
                                fullWidth
                                id="roleName"
                                placeholder="Enter role name"
                                label="Role Name"
                                variant="outlined"
                                error={!!errors.roleName}
                            />
                        )}
                    />
                </div>
                <div className='overflow-x-auto'>
                    <table className="md:min-w-full rounded-lg bg-white border-collapse border border-gray-300">
                        <thead>
                            <tr className="border-b static top-0">
                                <th style={{ color: theme.palette.primary.text.main, }} className="p-4 w-[25rem] text-left text-sm font-semibold">
                                    <div className='flex justify-start items-center'>
                                        <Checkbox
                                            checked={watch('functionalities')?.every((func) =>
                                                func.modules.every((module) =>
                                                    module.moduleAssignedActions.every((action) =>
                                                        module.roleAssignedActions.includes(action)
                                                    )
                                                )
                                            )}
                                            onChange={(e) => handleCheckAll(e.target.checked)}
                                        />
                                        <p>
                                            Functionality
                                        </p>
                                    </div>
                                </th>
                                <th style={{ color: theme.palette.primary.text.main, }} className="p-4 w-52 text-left text-sm font-semibold">
                                    Module
                                </th>
                                {headers?.map((header, index) => (
                                    <th style={{ color: theme.palette.primary.text.main, }} key={index} className="p-4 text-sm font-semibold">
                                        <div>
                                            <p className='text-left mb-1'>{header?.actionName}</p>
                                            <Checkbox
                                                checked={watch('functionalities')?.every((func) =>
                                                    func.modules.every((module) =>
                                                        module.moduleAssignedActions.includes(header.actionId) &&
                                                        module.roleAssignedActions.includes(header.actionId))
                                                )}
                                                onChange={(e) => handleCheckAllModulesAction(e.target.checked, header.actionId)}
                                            />
                                        </div>
                                    </th>
                                ))}

                            </tr>
                        </thead>
                        <tbody>
                            {functionalities?.map((func, funcIndex) => (
                                <React.Fragment key={func.functionalityId}>
                                    <tr style={{ color: theme.palette.primary.text.main, }} className="border-b">
                                        <td
                                            className="p-4 text-sm font-medium"
                                            rowSpan={func.modules?.length + 1}
                                        >
                                            <div className='flex justify-start items-center'>
                                                <Checkbox
                                                    checked={func.modules?.every((module) =>
                                                        module.moduleAssignedActions.every((action) =>
                                                            module.roleAssignedActions.includes(action)
                                                        )
                                                    )}
                                                    onChange={(e) => handleCheckAllFunctionalitiesModules(funcIndex, e.target.checked)}
                                                />
                                                <p>
                                                    {func.functionalityName}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    {func?.modules?.map((module, moduleIndex) => (
                                        <tr style={{ color: theme.palette.primary.text.main, }} key={module.moduleId} className="border-b">
                                            <td className="p-4 text-sm flex justify-start items-center gap-2">
                                                {module.moduleName}
                                                <Components.Tooltip title={module.moduleDescription || ""} arrow>
                                                    <span>
                                                        <CustomIcons iconName={'fa-solid fa-circle-info'} css='cursor-pointer text-gray-600 h-4 w-4' />
                                                    </span>
                                                </Components.Tooltip>
                                            </td>
                                            {headers?.map((header, headerIndex) => {
                                                const isActionAvailable = module.moduleAssignedActions.includes(header.actionId);

                                                // Explicitly return the <td> element
                                                return (
                                                    <td key={headerIndex} className="p-4 text-center">
                                                        {isActionAvailable ? (
                                                            <Controller
                                                                name={`functionalities.${funcIndex}.modules.${moduleIndex}.roleAssignedActions`}
                                                                control={control}
                                                                render={() => (
                                                                    <Checkbox
                                                                        checked={module.roleAssignedActions.includes(header.actionId)}
                                                                        onChange={(e) =>
                                                                            handleCheckboxChange(
                                                                                funcIndex,
                                                                                moduleIndex,
                                                                                header.actionId,
                                                                                e.target.checked
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        ) : null /* Render nothing if action is not available */}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='flex justify-end mt-5 gap-3'>
                    <div>
                        <Button type="button" text={"Back"} variant="contained" color="primary" onClick={() => navigate("/dashboard/manageroles")} />
                    </div>
                    <div>
                        <Button type="submit" text={id ? "Update role" : "Add role"} variant="contained" color="primary" isLoading={loading} />
                    </div>
                </div>
            </form>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(AddRoles)