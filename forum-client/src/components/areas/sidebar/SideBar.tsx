import React from "react";
import { useWindowDimension } from "../../../hooks/useWindowDimensions";
import SideBarMenu from "./SideBarMenu";

export default function SideBar() {
  const { width } = useWindowDimension();
  if (width <= 768) {
    return null;
  }
  return (
    <div className="sidebar">
      <SideBarMenu />
    </div>
  );
}
