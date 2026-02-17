import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function MainLayout() {
  return (
    <>
      <div style={{ paddingBottom: "60px" }}>
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}