// import React, { useEffect, useState } from 'react'
// import Components from '../../muiComponents/components'
// import AlertDialog from '../../common/alertDialog/alertDialog';

// import { Tooltip } from '@mui/material';
// import { HexColorPicker } from "react-colorful";
// import PropTypes from 'prop-types';
// import CustomIcons from '../../common/icons/CustomIcons';
// import Divider from '../../common/divider/divider'
// import { handleResetTheme, handleSetTheme, handleToogleSettingDrawer } from '../../../redux/commonReducers/commonReducers';
// import { connect } from 'react-redux';
// import { updateCompanyTheme } from '../../../service/companyTheme/companyThemeService';
// import Menu from '../../common/menu/Menu';

// const SettingDrawer = ({ handleSetTheme, settingDrawerWidth, openSettingDrawer, handleToogleSettingDrawer, handleResetTheme, props = {} }) => {
//     // const theme = useTheme();

//     const userInfo = JSON.parse(localStorage.getItem("userInfo"))
//     const themeColors = JSON.parse(sessionStorage.getItem("theme"))

//     const [anchorEl, setAnchorEl] = useState(null);
//     const open = Boolean(anchorEl);

//     const { window } = props;
//     const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
//     const [loading, setLoading] = useState(false);

//     const container = window !== undefined ? () => window().document.body : undefined;

//     const [selectedTheme, setSelectedTheme] = useState(themeColors?.primaryColor);
//     const [selectedTextTheme, setSelectedTextTheme] = useState(themeColors?.textColor);
//     const [selectedIconTheme, setSelectedIconTheme] = useState(themeColors?.iconColor);
//     const [selectedHeaderTheme, setSelectedHeaderTheme] = useState(themeColors?.headerBgColor);
//     const [selectedContentTheme, setSelectedContentTheme] = useState(themeColors?.contentBgColor);
//     const [selectedSideBarTheme, setSelectedSideBarTheme] = useState(themeColors?.sideNavigationBgColor);

//     const [color, setColor] = useState(themeColors?.primaryColor);
//     const [sideNavigationBgColor, setSideNavigationBgColor] = useState(themeColors?.sideNavigationBgColor);
//     const [contentBgColor, setContentBgColor] = useState(themeColors?.contentBgColor);
//     const [headerBgColor, setHeaderBgColor] = useState(themeColors?.headerBgColor);
//     const [textColor, setTextColor] = useState(themeColors?.textColor);
//     const [iconColor, setIconColor] = useState(themeColors?.iconColor);
//     const [type, setType] = useState('')

//     const [selectedColor, setSelectedColor] = useState('');

//     const colors = [
//         { id: 1, color: '#666cff' },
//         { id: 2, color: '#6CDB72' },
//         { id: 3, color: '#FF9E6F' },
//     ];

//     const handleOpenModel = () => {
//         setDialog({
//             open: true,
//             title: 'Reset Theme',
//             message: 'Are you sure ! Do you want to Reset Theme?',
//             actionButtonText: 'Reset'
//         });
//     }

//     const handleCloseModel = () => {
//         setDialog({
//             open: false,
//             title: '',
//             message: '',
//             actionButtonText: ''
//         });
//     }

//     const resetTheme = async () => {
//         setLoading(true)
//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: "#666cff",
//             sideNavigationBgColor: "#ffffff",
//             contentBgColor: "#F7F7F9",
//             headerBgColor: "#ffffff",
//             textColor: "#262b43",
//             iconColor: "#0000008a",
//             type: '',
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             setLoading(false)
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleResetTheme()
//             handleCloseModel()
//             setSelectedTheme(themeJson.primaryColor);
//             setSelectedTextTheme(themeJson.textColor);
//             setSelectedIconTheme(themeJson.iconColor);
//             setSelectedHeaderTheme(themeJson.headerBgColor);
//             setSelectedContentTheme(themeJson.contentBgColor);
//             setSelectedSideBarTheme(themeJson.sideNavigationBgColor);

//             setColor(themeJson.primaryColor);
//             setSideNavigationBgColor(themeJson.sideNavigationBgColor);
//             setContentBgColor(themeJson.contentBgColor);
//             setHeaderBgColor(themeJson.headerBgColor);
//             setTextColor(themeJson.textColor);
//             setIconColor(themeJson.iconColor);
//         } else {
//             setLoading(false)
//         }
//     }

//     const handleClose = async () => {
//         setAnchorEl(null);
//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: type,
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleClick = (event, type, currentColor) => {
//         setType(type)
//         setSelectedColor(currentColor)
//         setAnchorEl(event.currentTarget);
//     };

//     const handleChangeTheme = async (color) => {
//         setColor(color);
//         setSelectedTheme(color)

//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: "setColor",
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleChangeSideBarTheme = async (sidecolor) => {
//         setSideNavigationBgColor(sidecolor);
//         setSelectedSideBarTheme(sidecolor)
//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sidecolor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: "setSideNavigationBgColor",
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleChangeHeaderTheme = async (headerColor) => {
//         setHeaderBgColor(headerColor);
//         setSelectedHeaderTheme(headerColor)

//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: "setHeaderBgColor",
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleChangeContentTheme = async (contentColor) => {
//         setContentBgColor(contentColor);
//         setSelectedContentTheme(contentColor)
//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: "setContentBgColor",
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleChangeTextTheme = async (textColor) => {
//         setTextColor(textColor);
//         setSelectedTextTheme(textColor)

//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: "setTextColor",
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleChangeIconTheme = async (iconcolor) => {
//         setIconColor(iconcolor);
//         setSelectedIconTheme(iconcolor)

//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconcolor || null,
//             type: "setIconColor",
//         };
//         const res = await updateCompanyTheme(userInfo?.themeId, themeJson)
//         if (res?.data?.status === 200) {
//             sessionStorage.setItem("theme", JSON.stringify(themeJson))
//             handleSetTheme(themeJson)
//         }
//     };

//     const handleColorPicker = () => {
//         const themeJson = {
//             companyId: userInfo?.companyId,
//             primaryColor: color || null,
//             sideNavigationBgColor: sideNavigationBgColor || null,
//             contentBgColor: contentBgColor || null,
//             headerBgColor: headerBgColor || null,
//             textColor: textColor || null,
//             iconColor: iconColor || null,
//             type: type,
//         }
//         sessionStorage.setItem("theme", JSON.stringify(themeJson))
//         handleSetTheme(themeJson)
//     };

//     // useEffect(() => {
//     //     const themeColors = JSON.parse(sessionStorage.getItem("theme"));

//     //     if (themeColors) {
          
//     //     }
//     // }, [sessionStorage.getItem("theme")]);


//     useEffect(() => {
//         handleColorPicker()
//     }, [color, sideNavigationBgColor, headerBgColor, textColor, contentBgColor, iconColor])

//     const drawer = (
//         <div className='transition-all duration-300 ease-in-out '>
//             <div className="sticky top-0 bg-white z-50 text-xl font-['Inter'] py-3 w-full">
//                 <div className='px-4 flex justify-between items-center'>
//                     <div className={`flex-1 transition-opacity duration-30 opacity-100 text-gray-700 font-semibold`}>
//                         Settings
//                     </div>

//                     <Tooltip placement="bottom" arrow title="Reset Theme">
//                         <div className="flex items-center justify-center w-10 h-10">
//                             <Components.IconButton
//                                 onClick={() => handleOpenModel()}
//                                 className="transition-transform duration-300"
//                             >
//                                 <CustomIcons iconName={'fa-solid fa-arrows-rotate'} css='cursor-pointer h-5- w-5' />
//                             </Components.IconButton>
//                         </div>
//                     </Tooltip>

//                     <div className="flex items-center justify-center w-10 h-10">
//                         <Components.IconButton
//                             onClick={() => handleToogleSettingDrawer()}
//                             className="transition-transform duration-300"
//                         >
//                             <CustomIcons iconName={'fa-solid fa-xmark'} css='h-5- w-5' />
//                         </Components.IconButton>
//                     </div>
//                 </div>
//             </div>

//             <Divider />

//             <div className='px-4 mb-3'>
//                 <div>
//                     <p className="font-semibold my-4">Theme Colors</p>
//                     <div className="grid grid-cols-4 gap-4">
//                         {colors?.map(({ id, color }) => (
//                             <button
//                                 key={id}
//                                 className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedTheme === color ? '' : 'border-gray-200'}`}
//                                 onClick={() => handleChangeTheme(color)}
//                                 style={selectedTheme === color ? { borderColor: "#000000" } : {}}
//                             >
//                                 <div
//                                     className="w-8 h-8 rounded-full relative"
//                                     style={{ backgroundColor: color }}
//                                 />
//                             </button>
//                         ))}

//                         <button
//                             style={{ borderColor: "#000000" }}
//                             className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${color ? "" : "border-gray-200"} flex items-center justify-center relative`}
//                             onClick={(e) => handleClick(e, "setColor", color)}
//                         >
//                             <div
//                                 style={{ borderColor: "#000000" }}
//                                 className="w-8 h-8 border rounded-full relative"
//                                 style={{ backgroundColor: color }}
//                             />
//                         </button>

//                     </div>
//                 </div>

//                 <div>
//                     <p className="font-semibold my-4">Side Navigation Background Colors</p>
//                     <div className="grid grid-cols-4 gap-4">
//                         {colors?.map(({ id, color }) => (
//                             <button
//                                 key={id}
//                                 className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedSideBarTheme === color ? '' : 'border-gray-200'}`}
//                                 onClick={() => handleChangeSideBarTheme(color)}
//                                 style={selectedSideBarTheme === color ? { borderColor: "#000000" } : {}}
//                             >
//                                 <div
//                                     className="w-8 h-8 rounded-full relative"
//                                     style={{ backgroundColor: color }}
//                                 />
//                             </button>
//                         ))}

//                         <button
//                             style={{ borderColor: "#000000"}}
//                             className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${sideNavigationBgColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
//                             onClick={(e) => handleClick(e, "setSideNavigationBgColor", sideNavigationBgColor)}
//                         >
//                             <div
//                                 style={{ borderColor: "#000000"}}
//                                 className="w-8 h-8 border rounded-full relative"
//                                 style={{ backgroundColor: sideNavigationBgColor }}
//                             />
//                         </button>
//                     </div>
//                 </div>

//                 <div>
//                     <p className="font-semibold my-4">Header Background Colors</p>
//                     <div className="grid grid-cols-4 gap-4">
//                         {colors?.map(({ id, color }) => (
//                             <button
//                                 key={id}
//                                 className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedHeaderTheme === color ? '' : 'border-gray-200'}`}
//                                 onClick={() => handleChangeHeaderTheme(color)}
//                                 style={selectedHeaderTheme === color ? { borderColor: "#000000" } : {}}
//                             >
//                                 <div
//                                     className="w-8 h-8 rounded-full relative"
//                                     style={{ backgroundColor: color }}
//                                 />
//                             </button>
//                         ))}

//                         <button
//                             style={{ borderColor: "#000000"}}
//                             className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${headerBgColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
//                             onClick={(e) => handleClick(e, "setHeaderBgColor", headerBgColor)}
//                         >
//                             <div
//                                 style={{ borderColor: "#000000"}}
//                                 className="w-8 h-8 border rounded-full relative"
//                                 style={{ backgroundColor: headerBgColor }}
//                             />
//                         </button>
//                     </div>
//                 </div>

//                 <div>
//                     <p className="font-semibold my-4">Content Background Colors</p>
//                     <div className="grid grid-cols-4 gap-4">
//                         {colors?.map(({ id, color }) => (
//                             <button
//                                 key={id}
//                                 className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedContentTheme === color ? '' : 'border-gray-200'}`}
//                                 onClick={() => handleChangeContentTheme(color)}
//                                 style={selectedContentTheme === color ? { borderColor: "#000000" } : {}}
//                             >
//                                 <div
//                                     className="w-8 h-8 rounded-full relative"
//                                     style={{ backgroundColor: color }}
//                                 />
//                             </button>
//                         ))}

//                         <button
//                             style={{ borderColor: "#000000" }}
//                             className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${contentBgColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
//                             onClick={(e) => handleClick(e, "setContentBgColor", contentBgColor)}
//                         >
//                             <div
//                                 className="w-8 h-8 rounded-full relative"
//                                 style={{ backgroundColor: contentBgColor }}
//                             />
//                         </button>
//                     </div>
//                 </div>

//                 <div>
//                     <p className="font-semibold my-4">Font Colors</p>
//                     <div className="grid grid-cols-4 gap-4">
//                         {colors?.map(({ id, color }) => (
//                             <button
//                                 key={id}
//                                 className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedTextTheme === color ? '' : 'border-gray-200'}`}
//                                 onClick={() => handleChangeTextTheme(color)}
//                                 style={selectedTextTheme === color ? { borderColor: "#000000" } : {}}
//                             >
//                                 <div
//                                     className="w-8 h-8 rounded-full relative"
//                                     style={{ backgroundColor: color }}
//                                 />
//                             </button>
//                         ))}

//                         <button
//                             style={{ borderColor: "#000000"}}
//                             className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${textColor ? "" : "border-gray-200"} flex items-center justify-center relative`}
//                             onClick={(e) => handleClick(e, "setTextColor", textColor)}
//                         >
//                             <div
//                                 style={{ borderColor: "#000000"}}
//                                 className="w-8 h-8 border rounded-full relative"
//                                 style={{ backgroundColor: textColor }}
//                             />
//                         </button>
//                     </div>
//                 </div>

//                 <div>
//                     <p className="font-semibold my-4">Icon Colors</p>
//                     <div className="grid grid-cols-4 gap-4">
//                         {colors?.map(({ id, color }) => (
//                             <button
//                                 key={id}
//                                 className={`w-22 h-16 rounded-lg border flex items-center justify-center shadow-sm hover:shadow-md transition border-2 ${selectedIconTheme === color ? '' : 'border-gray-200'}`}
//                                 onClick={() => handleChangeIconTheme(color)}
//                                 style={selectedIconTheme === color ? { borderColor: "#000000" } : {}}
//                             >
//                                 <div
//                                     className="w-8 h-8 rounded-full relative"
//                                     style={{ backgroundColor: color }}
//                                 />
//                             </button>
//                         ))}

//                         <button
//                             style={{ borderColor: "#000000"}}
//                             className={`w-22 h-16 rounded-lg border shadow-sm hover:shadow-md transition border-2 ${iconColor ? '' : "border-gray-200"} flex items-center justify-center relative`}
//                             onClick={(e) => handleClick(e, "setIconColor", iconColor)}
//                         >
//                             <div
//                                 style={{ borderColor: "#000000"}}
//                                 className="w-8 h-8 border rounded-full relative"
//                                 style={{ backgroundColor: iconColor }}
//                             />
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <Menu
//                 id="demo-customized-menu"
//                 anchorEl={anchorEl}
//                 open={open}
//                 onClose={handleClose}
//                 MenuListProps={{
//                     'aria-labelledby': 'demo-customized-button',
//                 }}
//                 width={100}
//             >
//                 <div style={{ padding: '1rem' }}>
//                     <HexColorPicker
//                         color={selectedColor}
//                         onChange={type === "setColor" ? setColor : type === "setSideNavigationBgColor" ? setSideNavigationBgColor : type === "setHeaderBgColor" ? setHeaderBgColor : type === "setContentBgColor" ? setContentBgColor : type === "setIconColor" ? setIconColor : setTextColor}
//                     />
//                 </div>
//             </Menu>
//         </div>
//     );

//     return (
//         <div>
//             <Components.Drawer
//                 container={container}
//                 variant="temporary"
//                 open={openSettingDrawer}
//                 onClose={() => handleToogleSettingDrawer()}
//                 ModalProps={{
//                     keepMounted: true, // Better open performance on mobile.
//                 }}
//                 anchor={'right'}
//                 sx={{
//                     display: { xs: 'block', md: 'none' },
//                     '& .MuiDrawer-paper': {
//                         boxSizing: 'border-box',
//                         width: settingDrawerWidth,
//                         transition: 'width 0.3s ease-in-out', // smooth transition
//                         overflowX: 'hidden',
//                         right: 0,
//                     }
//                 }}
//             >
//                 {drawer}
//             </Components.Drawer>

//             <Components.Drawer
//                 variant="permanent"
//                 anchor="right"
//                 sx={{
//                     display: { xs: 'none', md: 'block' },
//                     '& .MuiDrawer-paper': {
//                         boxSizing: 'border-box',
//                         width: settingDrawerWidth,
//                         transition: 'width 0.3s ease-in-out', // smooth transition
//                         overflowX: 'hidden',
//                         right: 0,
//                     }
//                 }}
//                 open
//             >
//                 {drawer}
//             </Components.Drawer>
//             <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={resetTheme} handleClose={handleCloseModel} loading={loading} />

//         </div>
//     )
// }

// SettingDrawer.propTypes = {
//     window: PropTypes.func,
// };

// const mapStateToProps = (state) => ({
//     title: state.common.title,
//     openSettingDrawer: state.common.openSettingDrawer,
//     settingDrawerWidth: state.common.settingDrawerWidth
// });

// const mapDispatchToProps = {
//     handleSetTheme,
//     handleToogleSettingDrawer,
//     handleResetTheme
// };

// export default connect(mapStateToProps, mapDispatchToProps)(SettingDrawer)
