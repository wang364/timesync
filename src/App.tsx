import TimezonesBoard from "./components/TimezonesBoard";
import { useAtom } from "jotai";
import { syncUrlToSelectedTimezonesAtom } from "./atoms/selected-timezones";
import { useEffect } from "react";
import { useEventListener } from "./utils/hooks/use-event-listener";
import { setSearchTimezoneNameAtom } from "./atoms/search-timezone-name";
import { detectAnyDOMsOnMouseEvent } from "./utils";
import { dismissDatePickerModelAtom } from "./atoms/date";
import { readWriteUrlTimezonesNameAtom } from "./atoms/hash-url";
import { getCurrentUserTimezoneName } from "./utils/timezones";

function App() {
  const [, setSearchTimezoneName] = useAtom(setSearchTimezoneNameAtom);
  const [, dismissDatePickerModel] = useAtom(dismissDatePickerModelAtom);
  const [, syncUrlToSelectedTimezones] = useAtom(
    syncUrlToSelectedTimezonesAtom
  );
  const [urlTimezonesName, setUrlTimezonesName] = useAtom(
    readWriteUrlTimezonesNameAtom
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!urlTimezonesName.length) {
        setUrlTimezonesName(getCurrentUserTimezoneName());
      }
    }, 500);

    syncUrlToSelectedTimezones(urlTimezonesName);

    return () => clearTimeout(timeoutId);
  }, [setUrlTimezonesName, syncUrlToSelectedTimezones, urlTimezonesName]);

  function resetStatesOnOuterClick(e: MouseEvent) {
    if (
      !detectAnyDOMsOnMouseEvent(e, [
        "#hoursFormat-btn",
        "#searched-timezones",
        "#calendar-btn",
        "#calendar",
      ])
    ) {
      setSearchTimezoneName("");
      dismissDatePickerModel();
    }
  }

  useEventListener("click", resetStatesOnOuterClick);

  return (
    <div className="w-fit xl:w-full">
      <div className="main-bg-grid"></div>
      <main className=" dark:bg-zinc-900 dark:text-gray-100 h-fit w-full xl:w-full xl:overflow-x-hidden flex flex-col items-start lg:items-center">
        <div className="z-10 w-[1180px] mt-20 mx-8">
          <div className="py-4 px-2 mb-10 border primary_border bg-white dark:bg-zinc-900 rounded-md shadow-sm">
            <TimezonesBoard />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
