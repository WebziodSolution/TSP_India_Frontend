import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../buttons/button';
import CustomIcons from '../icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function AlertDialog({ open, handleClose, title, message, handleAction, actionButtonText, loading, note = null }) {
    const theme = useTheme();

    const onClose = () => {
        handleClose();
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                // onClose={onClose}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {title}
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
                <Components.DialogContent dividers style={{ color: theme.palette.primary.text.main, }}>
                    <Components.Typography
                        gutterBottom
                        sx={{ whiteSpace: "pre-line" }}
                    >
                        {message}
                    </Components.Typography>

                </Components.DialogContent>
                <Components.DialogActions>
                    <div className='flex justify-between items-center gap-4 w-full'>
                        <p className='text-sm text-red-400 w-3/4'>
                            {note ? `Note: ${note}` : ''}
                        </p>
                        <div>
                            <Button useFor={`error`} type={`button`} text={actionButtonText} onClick={handleAction} isLoading={loading} />
                        </div>
                    </div>
                </Components.DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
