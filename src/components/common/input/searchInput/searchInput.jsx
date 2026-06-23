import React, { forwardRef } from 'react';
import Components from '../../../muiComponents/components';
import { useTheme } from '@mui/material';

const SearchInput = forwardRef(({ name, label, placeholder, type, error, helperText, value, onChange, startIcon }, ref) => {
    const theme = useTheme();

    return (
        <Components.TextField
            variant="outlined"
            fullWidth
            name={name}
            label={label}
            placeholder={placeholder}
            type={type}
            value={value}
            onChange={onChange}
            inputRef={ref}
            error={!!error}
            helperText={helperText}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '0.5rem',
                    height: '3rem',
                    padding: 0,
                    border: 'none',
                    '& fieldset': {
                        border: 'none',
                    },
                    color: theme.palette.primary.text.main                    
                },
                '& .MuiInputLabel-root': {
                    color: error ? theme.palette.error.main : theme.palette.primary.text.main,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: error ? theme.palette.error.main : theme.palette.primary.main,
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
            InputProps={{
                startAdornment: startIcon
            }}
        />
    );
});

export default SearchInput;
