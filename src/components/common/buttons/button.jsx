import Components from '../../muiComponents/components';
import { useTheme } from '@mui/material';

const Button = ({
    useFor = "primary",
    type,
    text,
    onClick,
    disabled = false,
    isLoading = false,
    startIcon = null,
    endIcon = null,
    value = null,
    id,
}) => {
    const theme = useTheme();

    const buttonStyles = {
        background: useFor === "error" ? theme.palette.error.main
            : useFor === "primary" ? theme.palette.primary.main
                : useFor === "success" ? theme.palette.success.main
                    : useFor === "disabled" ? theme.palette.secondary.dark
                        : theme.palette.secondary.light,
        color: 'white',
        // color: theme.palette.primary.text.main,
        borderRadius: 2,
        textTransform: "capitalize",
        fontWeight: 500,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        height: 40
    };

    const ButtonComponent = isLoading ? Components.LoadingButton : Components.Button;

    return (
        <ButtonComponent
            fullWidth
            disabled={disabled || isLoading}
            type={type}
            onClick={onClick}
            sx={buttonStyles}
            variant="contained"
            loading={isLoading}
            startIcon={startIcon}
            endIcon={endIcon}
            id={id}
            data-value={value}
        >
            {text}
        </ButtonComponent>
    );
}

export default Button;
