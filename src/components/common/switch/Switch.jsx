import Components from "../../muiComponents/components";

const Switch = ({ text, onChange, checked = false, size }) => {

    return (
        <Components.FormGroup>
            <Components.Switch
                size={size}
                checked={checked}
                onChange={onChange}
                inputProps={{ 'aria-label': 'controlled' }}
            />
        </Components.FormGroup>
    );
};

export default Switch;
