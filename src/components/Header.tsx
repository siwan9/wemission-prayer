import React, { useState, useRef, useLayoutEffect } from "react";

import type { SettingDataReadDto } from "../types";


interface HeaderProps {
  settingData: SettingDataReadDto;
}

const Header: React.FC<HeaderProps> = ({ settingData }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<HTMLSpanElement[]>([]);
  const [fontSize, setFontSize] = useState(54);

  const titleLines = settingData.campTitle.split("\n");
  const season =
    settingData.campSeason === "여름"
      ? "SUMMER"
      : "WINTER";

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const resize = () => {
      const lines = lineRefs.current.filter(Boolean);

      let size = window.innerWidth < 640 ? 54 : 84;

      title.style.fontSize = `${size}px`;

      const parentWidth = title.parentElement!.clientWidth * 0.9;

      while (size > 28) {
        title.style.fontSize = `${size}px`;

        const longest = Math.max(
          ...lines.map(line => line.getBoundingClientRect().width)
        );

        if (longest <= parentWidth) break;

        size--;
      }

      setFontSize(size);
    };

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(title.parentElement!);

    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [settingData.campTitle]);

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
    <div className="flex justify-center w-full">
  <span
    className="
      uppercase
      tracking-[0.45em]
      text-lg
      text-white/80
      font-semibold
      relative
      left-[0.22em]
    "
  >
    {settingData.campYear} WEMISSION
  </span>
</div>

    <h1
      ref={titleRef}
      className="
        mt-6
        inline-flex
        flex-col
        gap-4
        items-start
        self-center
        select-none
      "
      style={{
        fontSize,
        lineHeight: 0.9,
        transform: "scaleY(0.95)",
      }}
    >
      {titleLines.map((line, index) => (
        <span
          key={index}
          ref={el => {
            if (el) lineRefs.current[index] = el;
          }}
          className="block font-pixel tracking-[-0.03em]"
          style={{
            color: "#f9a8d4",
            textShadow: `
              2px 2px 0 #f472b6,
              4px 4px 0 #db2777,
              6px 6px 0 #7e22ce
            `,
          }}
        >
          {line}
        </span>
      ))}
    </h1>

    <p
      className="
        mt-6
        uppercase
        tracking-[0.45em]
        text-pink-300
        font-black
        text-xl

        text-center
        w-full
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