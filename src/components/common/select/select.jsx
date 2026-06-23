import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const Select = forwardRef(({ size = "small", label, placeholder, error, helperText, value, onChange, options, disabled = false }, ref) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    // Ensure value is consistently an object or null
    const selectedOption = selectOptions.find((option) => option.id === value) || null;

    return (
        <Components.Autocomplete
            options={selectOptions}
            size={size}
            disabled={disabled}
            getOptionLabel={(option) => option?.title || ""}
            value={selectedOption}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={(event, newValue) => {
                onChange(event, newValue);
            }}
            noOptionsText={'No data found'}
            renderInput={(params) => (
                <Components.TextField
                    {...params}
                    label={label || 'Options'}
                    placeholder={placeholder || 'Select options'}
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
                            marginX: 0.5,
                        },
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;',
                    }}
                />
            )}
            componentsProps={{
                paper: {
                    sx: {
                        '& .MuiAutocomplete-option': {
                            padding: '0.5rem 1rem',
                            '&:hover': {
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.primary.text.main,
                            },
                        },
                    },
                },
            }}
        />
    );
});

export default Select;