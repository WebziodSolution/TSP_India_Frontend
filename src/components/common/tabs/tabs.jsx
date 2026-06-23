import React from "react";
import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

export const Tabs = ({ selectedTab, handleChange, tabsData, type = "default" }) => {
  const theme = useTheme();

  // Pill-style tabs (default)
  const getTabStyle = (index) => ({
    color: selectedTab === index ? "white" : theme.palette.primary.text.main,
    backgroundColor: selectedTab === index ? theme.palette.primary.main : "transparent",
    border: selectedTab === index ? `1px solid ${theme.palette.primary.main}` : "1px solid #BEC0C7",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: selectedTab === index ? "bold" : "normal",
    textTransform: "none",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    opacity: "1",
    cursor: "pointer"
  });

  // Underline-style tabs
  const getTabStyle2 = (index) => ({
    color: selectedTab === index ? theme.palette.primary.text.main : "#9E9E9E",
    fontWeight: selectedTab === index ? "600" : "normal",
    textTransform: "none",
    paddingBottom: "8px",
    borderBottom: selectedTab === index ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
    cursor: "pointer"
  });

  return (
    <Components.Box
      sx={{
        width: "100%",
        display: "flex",
        gap: "32px",
        ...(type !== "default" && {
          borderBottom: "1px solid #E0E0E0",
          // paddingBottom: "8px"
        })
      }}
    >
      {[...new Map(tabsData?.map(item => [item.label, item])).values()].map((item, index) => (
        <div
          key={index}
          style={type === "default" ? getTabStyle(index) : type === "underline" ? getTabStyle2(index) : null}
          onClick={() => handleChange(index)}
        >
          {item.label}
        </div>
      ))}

    </Components.Box>
  );
};
