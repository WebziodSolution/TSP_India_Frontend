import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import AlertDialog from '../../../common/alertDialog/alertDialog';

import { Tooltip, useTheme } from '@mui/material';
import { HexColorPicker } from "react-colorful";
import CustomIcons from '../../../common/icons/CustomIcons';
import Menu from '../../../common/menu/Menu';

import { updateCompanyTheme } from '../../../../service/companyTheme/companyThemeService';
import { handleResetTheme, handleSetTheme, handleSetTitle, handleToogleSettingDrawer } from '../../../../redux/commonReducers/commonReducers';

const colors = [
    { id: 1, color: '#666cff' },
    { id: 2, color: '#6CDB72' },
    { id: 3, color: '#FF9E6F' },
];

const CompanyTheme = ({ handleSetTheme, handleResetTheme, handleSetTitle }) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const themeColors = JSON.parse(sessionStorage.getItem("theme"))
    const theme = useTheme();

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);

    const [selectedTheme, setSelectedTheme] = useState(themeColors?.primaryColor);
    const [selectedTextTheme, setSelectedTextTheme] = useState(themeColors?.textColor);
    const [selectedHeaderTheme, setSelectedHeaderTheme] = useState(themeColors?.headerBgColor);
    const [selectedContentTheme, setSelectedContentTheme] = useState(themeColors?.contentBgColor);
    const [selectedSideBarTheme, setSelectedSideBarTheme] = useState(themeColors?.sideNavigationBgColor);

    const [color, setColor] = useState(themeColors?.primaryColor);
    const [sideNavigationBgColor, setSideNavigationBgColor] = useState(themeColors?.sideNavigationBgColor);
    const [contentBgColor, setContentBgColor] = useState(themeColors?.contentBgColor);
    const [headerBgColor, setHeaderBgColor] = useState(themeColors?.headerBgColor);
    const [textColor, setTextColor] = useState(themeColors?.textColor);
    const [type, setType] = useState('')

    const [selectedColor, setSelectedColor] = useState('');

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOpenModel = () => {
        setDialog({
            open: true,
            title: 'Reset Theme',
            message: 'Are you sure ! Do you want to Reset Theme?',
            actionButtonText: 'Reset'
        });
    }

    const handleCloseModel = () => {
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
    }

    const resetTheme = async () => {
        setLoading(true)
        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: "#666cff",
            sideNavigationBgColor: "#ffffff",
            contentBgColor: "#F7F7F9",
            headerBgColor: "#ffffff",
            textColor: "#262b43",
            iconColor: "#262b43",
            type: '',
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            setLoading(false)
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleResetTheme()
            handleCloseModel()
            setSelectedTheme(themeJson.primaryColor);
            setSelectedTextTheme(themeJson.textColor);
            setSelectedHeaderTheme(themeJson.headerBgColor);
            setSelectedContentTheme(themeJson.contentBgColor);
            setSelectedSideBarTheme(themeJson.sideNavigationBgColor);

            setColor(themeJson.primaryColor);
            setSideNavigationBgColor(themeJson.sideNavigationBgColor);
            setContentBgColor(themeJson.contentBgColor);
            setHeaderBgColor(themeJson.headerBgColor);
            setTextColor(themeJson.textColor);
        } else {
            setLoading(false)
        }
    }

    const handleClose = async () => {
        setAnchorEl(null);
        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sideNavigationBgColor || null,
            contentBgColor: contentBgColor || null,
            headerBgColor: headerBgColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: type,
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleSetTheme(themeJson)
        }
    };

    const handleClick = (event, type, currentColor) => {
        setType(type)
        setSelectedColor(currentColor)
        setAnchorEl(event.currentTarget);
    };

    const handleChangeTheme = async (color) => {
        setColor(color);
        setSelectedTheme(color)

        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sideNavigationBgColor || null,
            contentBgColor: contentBgColor || null,
            headerBgColor: headerBgColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: "setColor",
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleSetTheme(themeJson)
        }
    };

    const handleChangeSideBarTheme = async (sidecolor) => {
        setSideNavigationBgColor(sidecolor);
        setSelectedSideBarTheme(sidecolor)
        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sidecolor || null,
            contentBgColor: contentBgColor || null,
            headerBgColor: headerBgColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: "setSideNavigationBgColor",
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleSetTheme(themeJson)
        }
    };

    const handleChangeHeaderTheme = async (headerColor) => {
        setHeaderBgColor(headerColor);
        setSelectedHeaderTheme(headerColor)

        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sideNavigationBgColor || null,
            contentBgColor: contentBgColor || null,
            headerBgColor: headerColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: "setHeaderBgColor",
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleSetTheme(themeJson)
        }
    };

    const handleChangeContentTheme = async (contentColor) => {
        setContentBgColor(contentColor);
        setSelectedContentTheme(contentColor)
        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sideNavigationBgColor || null,
            contentBgColor: contentColor || null,
            headerBgColor: headerBgColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: "setContentBgColor",
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleSetTheme(themeJson)
        }
    };

    const handleChangeTextTheme = async (textColor) => {
        setTextColor(textColor);
        setSelectedTextTheme(textColor)

        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sideNavigationBgColor || null,
            contentBgColor: contentBgColor || null,
            headerBgColor: headerBgColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: "setTextColor",
        };
        const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
        if (res?.data?.status === 200) {
            sessionStorage.setItem("theme", JSON.stringify(themeJson))
            handleSetTheme(themeJson)
        }
    };

    const handleColorPicker = () => {
        const themeJson = {
            companyId: userInfo?.companyId,
            primaryColor: color || null,
            sideNavigationBgColor: sideNavigationBgColor || null,
            contentBgColor: contentBgColor || null,
            headerBgColor: headerBgColor || null,
            textColor: textColor || null,
            iconColor: "#262b43",
            type: type,
        }
        sessionStorage.setItem("theme", JSON.stringify(themeJson))
        handleSetTheme(themeJson)
    };

    useEffect(() => {
        handleColorPicker()
        // handleSetTitle("Company Theme")
    }, [color, sideNavigationBgColor, headerBgColor, textColor, contentBgColor])

    return (
        <div>
            <div className='flex justify-end'>
                <Tooltip placement="bottom" arrow title="Reset Theme">
                    <div style={{ backgroundColor: theme.palette.primary.main }}
                        className='h-10 w-10 flex justify-center items-center p-3 cursor-pointer rounded-full text-white'
                        onClick={() => handleOpenModel()}>
                        <CustomIcons iconName={'fa-solid fa-arrows-rotate'} css='cursor-pointer h-5- w-5' />
                    </div>
                </Tooltip>

            </div>

            <div className='px-4 mb-3 grid md:grid-cols-2 gap-3 md:gap-6'>
                <div>
                    <p className="font-semibold my-4">Theme Colors</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {colors?.map(({ id, color }) => (
                            <button
                                className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${color ? "" : "border-gray-200"} flex items-center justify-center relative`}
                                onClick={() => handleChangeTheme(color)}
                                style={selectedTheme === color ? { borderColor: "#000000" } : {}}
                            >
                                <div
                                    className="w-8 h-8 border rounded-full relative"
                                    style={{ backgroundColor: color }}
                                />
                            </button>
                        ))}
                        <button
                            style={{ borderColor: "#000000" }}
                            className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${color ? "" : "border-gray-200"} flex items-center justify-center relative`}
                            onClick={(e) => handleClick(e, "setColor", color)}
                        >
                            <div
                                className="w-8 h-8 border rounded-full relative"
                                style={{ borderColor: "#f3f3f3", backgroundColor: color }}
                            />
                        </button>
                    </div>
                </div>

                <div className="md:border-l-2 md:border-gray-300">
                    <p className="font-semibold my-4 md:pl-4">Side Navigation Background Colors</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:pl-4">
                        {colors?.map(({ id, color }) => (
                            <button
                                key={id}
                                className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedSideBarTheme === color ? '' : 'border-gray-200'}`}
                                onClick={() => handleChangeSideBarTheme(color)}
                                style={selectedSideBarTheme === color ? { borderColor: "#000000" } : {}}
                            >
                                <div
                                    className="w-8 h-8 rounded-full relative"
                                    style={{ backgroundColor: color }}
                                />
                            </button>
                        ))}

                        <button
                            style={{ borderColor: "#000000" }}
                            className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${sideNavigationBgColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
                            onClick={(e) => handleClick(e, "setSideNavigationBgColor", sideNavigationBgColor)}
                        >
                            <div
                                className="w-8 h-8 border rounded-full relative"
                                style={{ borderColor: "#f3f3f3", backgroundColor: sideNavigationBgColor }}
                            />
                        </button>
                    </div>
                </div>

                <div>
                    <p className="font-semibold my-4">Header Background Colors</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {colors?.map(({ id, color }) => (
                            <button
                                key={id}
                                className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedHeaderTheme === color ? '' : 'border-gray-200'}`}
                                onClick={() => handleChangeHeaderTheme(color)}
                                style={selectedHeaderTheme === color ? { borderColor: "#000000" } : {}}
                            >
                                <div
                                    className="w-8 h-8 rounded-full relative"
                                    style={{ backgroundColor: color }}
                                />
                            </button>
                        ))}

                        <button
                            style={{ borderColor: "#000000" }}
                            className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${headerBgColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
                            onClick={(e) => handleClick(e, "setHeaderBgColor", headerBgColor)}
                        >
                            <div
                                className="w-8 h-8 rounded-full relative"
                                style={{ backgroundColor: headerBgColor }}
                            />
                        </button>
                    </div>
                </div>

                <div className="md:border-l-2 md:border-gray-300">
                    <p className="font-semibold my-4 md:pl-4">Content Background Colors</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:pl-4">
                        {colors?.map(({ id, color }) => (
                            <button
                                key={id}
                                className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedContentTheme === color ? '' : 'border-gray-200'}`}
                                onClick={() => handleChangeContentTheme(color)}
                                style={selectedContentTheme === color ? { borderColor: "#000000" } : {}}
                            >
                                <div
                                    className="w-8 h-8 rounded-full relative"
                                    style={{ backgroundColor: color }}
                                />
                            </button>
                        ))}

                        <button
                            style={{ borderColor: "#000000" }}
                            className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${contentBgColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
                            onClick={(e) => handleClick(e, "setContentBgColor", contentBgColor)}
                        >
                            <div
                                className="w-8 h-8 rounded-full relative"
                                style={{ backgroundColor: contentBgColor }}
                            />
                        </button>
                    </div>
                </div>

                <div>
                    <p className="font-semibold my-4">Font Colors</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {colors?.map(({ id, color }) => (
                            <button
                                key={id}
                                className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedTextTheme === color ? '' : 'border-gray-200'}`}
                                onClick={() => handleChangeTextTheme(color)}
                                style={selectedTextTheme === color ? { borderColor: "#000000" } : {}}
                            >
                                <div
                                    className="w-8 h-8 rounded-full relative"
                                    style={{ backgroundColor: color }}
                                />
                            </button>
                        ))}

                        <button
                            style={{ borderColor: "#000000" }}
                            className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${textColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
                            onClick={(e) => handleClick(e, "setTextColor", textColor)}
                        >
                            <div
                                className="w-8 h-8 border rounded-full relative"
                                style={{ borderColor: "#f3f3f3", backgroundColor: textColor }}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <Menu
                id="demo-customized-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'demo-customized-button',
                }}
                width={100}
            >
                <div style={{ padding: '1rem' }}>
                    <HexColorPicker
                        color={selectedColor}
                        onChange={type === "setColor" ? setColor : type === "setSideNavigationBgColor" ? setSideNavigationBgColor : type === "setHeaderBgColor" ? setHeaderBgColor : type === "setContentBgColor" ? setContentBgColor : setTextColor}
                    />
                </div>
            </Menu>
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={resetTheme} handleClose={handleCloseModel} loading={loading} />
        </div>
    )
}

const mapDispatchToProps = {
    handleSetTheme,
    handleToogleSettingDrawer,
    handleResetTheme,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(CompanyTheme)