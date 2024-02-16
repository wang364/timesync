import { SetStateAction, useEffect, useRef, useState } from "react";
import { END_INDEX, DEFAULT_WINDOW_WIDTH } from "./TimeSelectionOverlay";
import { cn } from "~/utils/cn";
import { useAtom } from "jotai";
import { selectedTimezonesAtom } from "~/atoms/selected-timezones";
import { isDecimal } from "~/utils/timezones";

function calMeetingHours(
  timeDials: ITimeDial[],
  timeWindowIndex: { start: number; end: number }
) {
  // const obj = {
  //   hour12: {
  //     start: [],
  //     end: []
  //   },
  //   hour24: {
  //     start: [],
  //     end: []
  //   }
  // }

  let meetingHours: Record<string, string[]> = {
    end: [],
    start: [],
  };

  for (const i in timeWindowIndex) {
    const idx =
      timeWindowIndex[i as keyof typeof timeWindowIndex] % timeDials.length;
    const timeDial = timeDials[Math.floor(idx)];
    let hours = timeDial.hour24;
    let minutes = 0;

    if (isDecimal(hours) && isDecimal(idx)) {
      hours = Math.floor(hours) + 1;
    } else if (isDecimal(idx)) {
      minutes = 30;
    } else if (isDecimal(hours)) {
      hours = Math.floor(hours);
      minutes = 30;
    }

    const time =
      hours + ":" + (minutes ? minutes : "00") + " " + timeDial.timeMeridian;

    const r = [time, timeDial.date];

    meetingHours[i as keyof typeof meetingHours] = r;
  }

  return meetingHours;
}

export interface ITimeWindowProps {
  isStopTimeWindow: boolean;
  frameWidth: number;
  isBlockClicked: boolean;
  mouseXposition: number;
  setIsStopTimeWindow: React.Dispatch<SetStateAction<boolean>>;
  moveTimeWindow: (e: React.MouseEvent) => void;
  setIsBlockClicked: React.Dispatch<SetStateAction<boolean>>;
  setMouseXposition: React.Dispatch<SetStateAction<number>>;
  setFrameWidth: React.Dispatch<SetStateAction<number>>;
}

const HALF_WINDOW_WIDTH = 17;

export default function TimeWindow({
  isStopTimeWindow,
  frameWidth,
  mouseXposition,
  isBlockClicked,
  moveTimeWindow,
  setIsStopTimeWindow,
  setIsBlockClicked,
  setMouseXposition,
  setFrameWidth,
}: ITimeWindowProps) {
  const [sidesOfTimeWindow, setSidesOfTimeWindow] = useState<
    "left" | "right" | ""
  >("");
  const [timeWindowIndex, setTimeWindowIndex] = useState({ start: 0, end: 0 });
  const timeWindowDivRef = useRef<HTMLDivElement>(null);
  const [, setSelectedTimezones] = useAtom(selectedTimezonesAtom);

  function getIndexOfLeftTimeDial() {
    const halfHour = sidesOfTimeWindow === "right" ? 0.5 : 0;
    return mouseXposition / DEFAULT_WINDOW_WIDTH + halfHour;
  }

  function stopTimeWindow() {
    setIsStopTimeWindow(!isStopTimeWindow);
    frameWidth === DEFAULT_WINDOW_WIDTH
      ? setFrameWidth(frameWidth / 2)
      : setFrameWidth(DEFAULT_WINDOW_WIDTH);
    setIsBlockClicked(false);

    setTimeWindowIndex((p) => ({ ...p, start: getIndexOfLeftTimeDial() }));
  }

  useEffect(() => {
    setSelectedTimezones((prevTimezones) => {
      return prevTimezones.map((tz) => {
        calMeetingHours(tz.timeDials, timeWindowIndex);

        return tz;
      });
    });
  }, [isStopTimeWindow, isBlockClicked]);

  function handleMouseDown(event: React.MouseEvent) {
    stopTimeWindow();
    moveTimeWindow(event);
    if (isStopTimeWindow) return;
    const initialX = event.clientX;
    // if clicked the right panel of timeWindow, it should move +HALF_WINDOW_WIDTH
    if (sidesOfTimeWindow === "right")
      setMouseXposition((p) => p + HALF_WINDOW_WIDTH);

    function handleMouseMove(event: MouseEvent) {
      const dX = event.clientX - initialX;
      const numberOfHalfTimeDial = Math.floor(dX / HALF_WINDOW_WIDTH) || 1;
      const newWindowWidth = numberOfHalfTimeDial * HALF_WINDOW_WIDTH;
      const indexOfLeftTimeDial = getIndexOfLeftTimeDial();
      const start = indexOfLeftTimeDial;
      const end = indexOfLeftTimeDial + newWindowWidth / DEFAULT_WINDOW_WIDTH;

      setTimeWindowIndex({ start, end });

      const isWithinTimeDials =
        newWindowWidth > HALF_WINDOW_WIDTH &&
        numberOfHalfTimeDial / 2 <= END_INDEX + 1 - indexOfLeftTimeDial;

      setFrameWidth(isWithinTimeDials ? newWindowWidth : HALF_WINDOW_WIDTH);
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMouseMoveOnTimeWindow(e: React.MouseEvent) {
    const timeWindowX = timeWindowDivRef.current?.getBoundingClientRect().x!;
    const dX = e.clientX - timeWindowX;
    dX <= 17 ? setSidesOfTimeWindow("left") : setSidesOfTimeWindow("right");
  }

  return (
    <div
      className={cn(
        "absolute h-full border-2 border-dotted border-red-500 rounded-md transition-all ease-out",
        {
          "transition-none cursor-e-resize":
            isStopTimeWindow && !isBlockClicked,
        }
      )}
      style={{
        left: mouseXposition,
        width: `${frameWidth + 2}px`,
        resize: "horizontal",
      }}
      ref={timeWindowDivRef}
      onClick={handleMouseDown}
      onMouseMove={handleMouseMoveOnTimeWindow}
      onMouseLeave={() => setSidesOfTimeWindow("")}
    >
      <div
        className={cn(
          "w-[17px] h-full absolute left-0 top-0 rounded-tl-md rounded-bl-md transition-colors",
          {
            "bg-red-600/10": sidesOfTimeWindow === "left" && !isBlockClicked,
          }
        )}
      ></div>
      <div
        className={cn(
          "w-[17px] h-full absolute right-0 top-0 rounded-tr-md rounded-br-md transition-colors",
          {
            "bg-red-600/10": sidesOfTimeWindow === "right" && !isBlockClicked,
          }
        )}
      ></div>
    </div>
  );
}
