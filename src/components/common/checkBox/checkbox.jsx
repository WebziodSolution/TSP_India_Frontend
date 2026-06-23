import React from "react";
import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

const Checkbox = ({ text, onChange, checked = false, disabled }) => {
    const theme = useTheme();

    return (
        <Components.FormGroup>
            <Components.FormControlLabel
                control={
                    <Components.Checkbox
                        disabled={disabled}
                        size="small"
                        sx={{
                            "&.Mui-checked": {
                                color: theme.palette.primary.main,
                            },
                            "&.MuiSvgIcon-root": {
                                color: theme.palette.primary.main,
                            },
                            color: theme.palette.primary.main,
                            paddingY: 0,
                        }}
                        checked={checked}
                        onChange={onChange}
                    />
                }
                label={text}
                sx={{
                    color: theme.palette.primary.main,
                    margin: 0,
                }}
            />
        </Components.FormGroup>
    );
};

export default Checkbox;
