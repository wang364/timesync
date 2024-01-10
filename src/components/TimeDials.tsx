import { memo, useMemo } from "react";
import {
  type Timezone,
  isDecimal,
  getTimeDials,
} from "~/utils/hooks/use-timezones";
import { cn } from "~/utils/cn";
import { useAtom } from "jotai";
import { hoursFormatAtom } from "~/atoms/hours-format";
import { dialColorWithLocalStorageAtom } from "~/atoms/dial-colors-model";
import { currentDateAtom } from "~/atoms/date";

interface Props {
  timezone: Timezone;
}

function NewDay({ day }: { day: string }) {
  const [dayOfWeek, monthAndDay] = day.split(", ");
  const [month, numOfDay] = monthAndDay.split(" ");
  return (
    <>
      <span className="absolute  inset-x-0 bottom-10 text-xs text-gray-400">
        {dayOfWeek}
      </span>
      <div className={cn("text-xs")}>
        <p className="flex flex-col ">
          <span>{month}</span>
          <span>{numOfDay}</span>
        </p>
      </div>
    </>
  );
}

export default memo(function TimeDials({ timezone }: Props) {
  const [hoursFormat] = useAtom(hoursFormatAtom);
  const [dialColor] = useAtom(dialColorWithLocalStorageAtom);

  const timeDials = useMemo(
    () => getTimeDials(timezone, dialColor),
    [dialColor]
  );

  timezone.timeDials = timeDials;

  return (
    <main>
      <div className="h-[40px] w-[768px] flex items-center  text-center text-sm rounded-l-md">
        {timezone.timeDials.map((timezone, index) => {
          const { dailyCircleBgColor, isNewDay, day, isLastHour } = timezone;
          const hour = timezone[hoursFormat];
          return (
            <div
              key={index}
              className={cn(
                "w-[32px] h-full  py-1 first:rounded-l-md relative flex items-center justify-center text-dial-newday dark:text-white",
                dailyCircleBgColor,
                {
                  "!rounded-l-md !bg-dial-newday  !text-white": isNewDay,
                  "!rounded-r-md": isLastHour,
                  "!text-white": dailyCircleBgColor.includes("newday"),
                  "!text-zinc-100": dailyCircleBgColor.includes("midnight"),
                }
              )}
            >
              {isNewDay ? (
                <NewDay day={day} />
              ) : isDecimal(hour) && hour > 1 ? (
                <p className="flex flex-col leading-3">
                  {hour
                    .toString()
                    .split(".")
                    .map((strNum, index) => {
                      return (
                        <span
                          className={cn("text-zinc-800 dark:text-white", {
                            "text-[11px] text-zinc-400": index === 1,
                            "!text-zinc-100":
                              dailyCircleBgColor.includes("midnight"),
                          })}
                          key={index}
                        >
                          {index === 1 ? 30 : strNum}
                        </span>
                      );
                    })}
                </p>
              ) : (
                <span>{isNewDay ? <NewDay day={day} /> : hour}</span>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
});
