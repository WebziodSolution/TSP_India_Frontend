import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';

const SelectMultiple = forwardRef(({ size = "small", label, placeholder, error, helperText, value, onChange, options }, ref) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    return (
        <Components.Autocomplete
            multiple={true}
            options={selectOptions}
            size={size}
            getOptionLabel={(option) => option?.title || ''} // Provide a fallback
            value={selectOptions.filter((option) => (value || []).includes(option.id))}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(event, newValue) => {
                onChange(newValue.map((option) => option.id));                
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
                            color: theme.palette.secondary.contrastText,
                        },
                        '& .Mui-disabled': {
                            color: theme.palette.secondary.contrastText,
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
            limitTags={2}
            id="multiple-limit-tags"
        />
    );
});

export default SelectMultiple;