import React from "react";
import type { SettingDataReadDto } from "../types";


interface HeaderProps {
  settingData: SettingDataReadDto;
}

const Header: React.FC<HeaderProps> = ({ settingData }) => {
  const season =
    settingData.campSeason === "여름"
      ? "SUMMER"
      : "WINTER";

  return (
   <header
  className="
    relative
    flex flex-col
    items-center
    text-center
    pt-20
    pb-10 
  "
>
    <span
  className="
    uppercase
    tracking-[0.45em]
    text-lg
    text-white/80
    font-semibold
  "
>
  {settingData.campYear} WEMISSION
</span>

    <h1
      className="
        font-pixel
        mt-6
        text-[3.4rem]
        sm:text-[4.2rem]
        md:text-[5.2rem]
        leading-[1.2]
        md:leading-[0.85]
        tracking-[-0.03em]
        select-none
      "
      style={{
        color: "#f9a8d4",
        textShadow: `
          2px 2px 0 #f472b6,
          4px 4px 0 #db2777,
          6px 6px 0 #7e22ce
        `,
        transform: "scaleY(0.95)"
      }}
    >
      {settingData.campTitle}
    </h1>

    <p
      className="
        mt-6
        uppercase
        tracking-[0.45em]
        text-pink-300
        font-black
        text-xl
      "
    >
      {season} CAMP
    </p>

    <div className="mt-10 w-32 h-[2px] bg-pink-300/70" />

    <span className="
        mt-8
        text-sm
        tracking-[0.4em]
        uppercase
        text-pink-300
        font-medium
      ">
        DAYS OF PRAYER
    </span>

    <h2
      className="
        mt-2
        text-2xl
        md:text-3xl
        font-bold
        text-white
      "
      style={{
        textShadow: "0 2px 12px rgba(0,0,0,0.8)"
      }}
    >
        릴레이 금식기도
    </h2>

</header>
  );
};

export default Header;