// import React, { useEffect, useState } from 'react';
// import { styled, useTheme } from '@mui/material/styles';
// import Components from '../../muiComponents/components';
// import Button from '../../common/buttons/button';
// import { Controller, useForm } from 'react-hook-form';
// import { connect } from 'react-redux';
// import { setAlert } from '../../../redux/commonReducers/commonReducers';
// import CustomIcons from '../../common/icons/CustomIcons';
// import { getAllEmployeeListByCompanyId } from '../../../service/companyEmployee/companyEmployeeService';
// import { getOvertimeRule } from '../../../service/overtimeRules/overtimeRulesService';
// import SelectMultiple from '../../common/select/selectMultiple';

// const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
//     '& .MuiDialogContent-root': {
//         padding: theme.spacing(2),
//     },
//     '& .MuiDialogActions-root': {
//         padding: theme.spacing(1),
//     },
// }));

// function AsignRulesToUsers({ setAlert, open, handleClose, overTimeId, handleGetAllOvertimeRules }) {
//     const theme = useTheme()
//     const [loading, setLoading] = useState(false);
//     const userInfo = JSON.parse(localStorage.getItem("userInfo"))
//     const [users, setUsers] = useState([]);

//     const {
//         handleSubmit,
//         control,
//         reset,
//     } = useForm({
//         defaultValues: {
//             userIds: []
//         },
//     });

//     const onClose = () => {
//         setLoading(false);
//         reset({
//             userIds: []
//         });
//         handleClose();
//     };

//     const submit = async (data) => {
//         const userIds = JSON.stringify(data.userIds);
//         setLoading(true);
//         try {
//             const response = await assignOvertimeRuleToEmployee(overTimeId, { userIds: userIds });
//             if (response?.data?.status === 200) {
//                 setAlert({
//                     open: true,
//                     message: response?.data?.message,
//                     type: 'success',
//                 });
//                 onClose();
//                 handleGetAllOvertimeRules();
//             } else {
//                 setLoading(false);
//                 setAlert({
//                     open: true,
//                     message: response?.data?.message,
//                     type: 'error',
//                 });
//             }
//         } catch (error) {
//             setLoading(false);
//             setAlert({
//                 message: error.message || 'Something went wrong',
//                 type: 'error',
//             });
//         } finally {
//             setLoading(false);
//         }
//     }

//     const handleGetOvertimeRuleById = async () => {
//         if (overTimeId !== null && open) {
//             const response = await getOvertimeRule(overTimeId);
//             if (response?.data?.status === 200) {
//                 const data = response?.data?.result;
//                 reset({
//                     userIds: data?.userIds !== null ? JSON.parse(data?.userIds) : [],
//                 });
//             }
//         }
//     }

//     const handleGetAllUsers = async () => {
//         if (open) {
//             const response = await getAllEmployeeListByCompanyId(userInfo?.companyId);
//             if (response?.data?.status === 200) {
//                 const data = response?.data?.result?.map((item, index) => ({
//                     id: item.employeeId,
//                     title: item.userName,
//                 }));
//                 setUsers(data);
//                 handleGetOvertimeRuleById();
//             }
//         }
//     }


//     useEffect(() => {
//         handleGetAllUsers();
//     }, [open])

//     return (
//         <React.Fragment>
//             <BootstrapDialog
//                 open={open}
//                 // onClose={onClose}
//                 aria-labelledby="customized-dialog-title"
//                 fullWidth
//                 maxWidth='sm'
//             >
//                 <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
//                     Assign Overtime Rules To Employee
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

//                 <form noValidate onSubmit={handleSubmit(submit)}>
//                     <Components.DialogContent dividers>
//                         <Controller
//                             name="userIds"
//                             control={control}
//                             render={({ field }) => (
//                                 <SelectMultiple
//                                     options={users}
//                                     label={"Select Employees"}
//                                     placeholder="Select employees"
//                                     value={field.value || []}
//                                     onChange={(newValue) => {
//                                         field.onChange(newValue);
//                                     }}
//                                 />
//                             )}
//                         />
//                     </Components.DialogContent>
//                     <Components.DialogActions>
//                         <div className='flex justify-end'>
//                             <Button type={`submit`} text={"Submit"} isLoading={loading} />
//                         </div>
//                     </Components.DialogActions>
//                 </form>
//             </BootstrapDialog>
//         </React.Fragment>
//     );
// }

// const mapDispatchToProps = {
//     setAlert,
// };

// export default connect(null, mapDispatchToProps)(AsignRulesToUsers)
