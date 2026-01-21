import React from "react";
import { useNavigate } from "react-router-dom";
import { H1 } from "../UI/Typography";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm">
      {/* Top Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <span
          className="material-symbols-outlined text-slate-900 dark:text-white"
          style={{ fontSize: "24px" }}
        >
          arrow_back
        </span>
      </button>
      <H1 className="flex-1 text-center pr-10">BizSlot</H1>
    </div>
  );
};
export default Header;
