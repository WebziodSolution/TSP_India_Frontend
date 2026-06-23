import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material';
import Components from '../../muiComponents/components';
import Checkbox from '../checkBox/checkbox';

const CheckBoxSelect = forwardRef(
  (
    {
      size = "small",
      label,
      placeholder,
      error,
      helperText,
      value = [],
      onChange,
      options,
      disabled = false,
      checkAll = false,
    },
    ref
  ) => {
    const theme = useTheme();
    const selectOptions = Array.isArray(options) && options.length > 0 ? options : [];

    // Add virtual "Select All" item only for rendering, not stored in value
    const finalOptions = checkAll
      ? [{ id: "__all__", title: "Select All" }, ...selectOptions]
      : selectOptions;

    const handleChange = (event, newValue) => {
      // Handle "Select All" click
      const allOption = newValue.find((opt) => opt.id === "__all__");

      if (allOption) {
        if (value.length === selectOptions.length) {
          // if already all selected → clear all
          onChange(event, []);
        } else {
          // otherwise select all
          onChange(event, [...selectOptions]);
        }
        return;
      }

      // Otherwise, normal multiple selection
      onChange(event, newValue);
    };

    return (
      <Components.Autocomplete
        multiple
        disableCloseOnSelect
        options={finalOptions}
        size={size}
        disabled={disabled}
        getOptionLabel={(option) => option?.title || ""}
        value={value}
        isOptionEqualToValue={(option, val) => option?.id === val?.id}
        onChange={handleChange}
        noOptionsText={"No data found"}
        renderOption={(props, option, { selected }) => {
          // Render "Select All" state
          if (option.id === "__all__") {
            const isAllChecked = value.length === selectOptions.length;
            return (
              <li {...props}>
                <Checkbox checked={isAllChecked} />
                <Components.ListItemText primary={option.title} />
              </li>
            );
          }

          // Normal option
          return (
            <li {...props}>
              <Checkbox checked={selected} />
              <Components.ListItemText primary={option.title} />
            </li>
          );
        }}
        renderInput={(params) => (
          <Components.TextField
            {...params}
            label={label || "Options"}
            placeholder={placeholder || "Select options"}
            error={!!error}
            helperText={helperText}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.5rem',
                transition:
                  'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                '& fieldset': {
                  borderColor: error
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                },
                '&:hover fieldset': {
                  borderColor: error
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: error
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                color: error
                  ? theme.palette.error.main
                  : theme.palette.primary.text.main,
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: error
                  ? theme.palette.error.main
                  : theme.palette.primary.text.main,
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
              fontFamily:
                '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;',
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
  }
);

export default CheckBoxSelect;
