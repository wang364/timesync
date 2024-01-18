import { useAtom } from "jotai";
import { useSearchParams } from "react-router-dom";
import { selectedDateAtom } from "~/atoms/date";
import { cn } from "~/utils/cn";

interface IProps {
  currentDate: string;
}

export default function DateDial({ currentDate }: IProps) {
  const [dayOfWeek, monthAndDay] = currentDate.split(", ");
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [, numOfDay] = monthAndDay.split(" ");
  const [searchParams, setSearchParams] = useSearchParams();

  const isSelectedDate = selectedDate === currentDate;

  function handleClick() {
    setSelectedDate(currentDate);
    setSearchParams((prevParams) => {
      if (searchParams.get("selectedDate")) {
        prevParams.set("selectedDate", currentDate);
      } else {
        prevParams.append("selectedDate", currentDate);
      }
      return prevParams;
    });
  }

  return (
    <button
      className={cn(
        "flex flex-col items-center transition-colors p-[2px] w-9 rounded-md primary_border hover:text-zinc-900 dark:hover:text-zinc-50",
        {
          "shadow-inner  text-zinc-400": !isSelectedDate,
        }
      )}
      onClick={handleClick}
    >
      <span>{numOfDay}</span>
      <span>{dayOfWeek}</span>
    </button>
  );
}
