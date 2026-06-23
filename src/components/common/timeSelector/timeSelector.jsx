import Select from "../select/select";

const TimeSelector = ({ hours, minutes, onChangeHours, onChangeMinutes }) => {
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        title: String(i).padStart(2, "0"),
    }));

    const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        title: String(i).padStart(2, "0"),
    }));

    return (
        <div className="flex items-center gap-2">
            <Select
                label="HH"
                value={hours}
                onChange={(e, newValue) => onChangeHours(newValue?.id ?? 0)}
                options={hourOptions}
            />
            <span className="text-lg">:</span>
            <Select
                label="MM"
                value={minutes}
                onChange={(e, newValue) => onChangeMinutes(newValue?.id ?? 0)}
                options={minuteOptions}
            />
        </div>
    );
};

export default TimeSelector;
