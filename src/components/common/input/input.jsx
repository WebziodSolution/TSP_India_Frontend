import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const Input = forwardRef(({ disabled = false, multiline = false, rows = 2, name, label, placeholder, type, error, helperText, value, onChange, endIcon, InputLabelProps, onFocus, onBlur,}, ref) => {
    const theme = useTheme();
    return (
        <Components.TextField
            variant="outlined"
            multiline={multiline}
            rows={rows}
            fullWidth
            disabled={disabled}
            size='small'
            name={name}
            label={label}
            placeholder={placeholder}
            value={type === 'date' ? value || new Date().toISOString().split('T')[0] : value}
            type={type}
            onChange={onChange}
            inputRef={ref}
            error={!!error}
            helperText={helperText}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                    '& fieldset': {
                        borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                    },
                    '&:hover fieldset': {
                        borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                    },
                },
                '& .MuiInputLabel-root': {
                    color: error ? theme.palette.error.main : theme.palette.primary.text.main,
                    textTransform: "capitalize"
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: error ? theme.palette.error.main : theme.palette.primary.text.main,
                },
                '& .MuiInputBase-input': {
                    color: theme.palette.primary.text.main,
                },
                '& .Mui-disabled': {
                    color: theme.palette.primary.text.main,
                },
                '& .MuiFormHelperText-root': {
                    color: theme.palette.error.main,
                    fontSize: '14px',
                    fontWeight: '500',
                    marginX: 0.5
                },
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;'
            }}
            InputLabelProps={InputLabelProps}
            InputProps={{
                endAdornment: endIcon
            }}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
});
export default Input;
