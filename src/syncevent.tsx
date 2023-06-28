import { showToast, Toast, getPreferenceValues, List, Action, ActionPanel, Color, Icon } from "@raycast/api";
import React, { useEffect, useMemo, useState } from "react";
import { getCalendarEvents, updateEventUrlById } from "./utils/jxa";
import { createTaskAndEditWeekWork, Preferences } from "./service/foneApi";
import useStartApp from "./hooks/useStartApp";

const SyncEvent: React.FC<Record<string, never>> = () => {
  const [allEvents, setAllEvents] = useState<any[] | null>(null);
  const { isInitCompleted } = useStartApp();

  const { projectId } = getPreferenceValues<Preferences>();

  useEffect(() => {
    const getAllEvents = async () => {
      const sep = 3 * 24 * 60 * 60 * 1000;
      const curDate = new Date();
      const endDate = new Date(curDate.getTime() + sep);
      const startDate = new Date(curDate.getTime() - sep);
      const dingStartDate = new Date(curDate.getTime() - sep / 3);
      const dingEndDate = new Date(curDate.getTime());
      const foneEvents = await getCalendarEvents("Fone", startDate, endDate);
      console.log("ccccccc", foneEvents);
      const dingEvents = await getCalendarEvents("我的日历（钉钉）", dingStartDate, dingEndDate);
      console.log("aaaaaaa", dingEvents);
      const events = [...JSON.parse(foneEvents), ...JSON.parse(dingEvents)];
      setAllEvents(events);
    };

    if (isInitCompleted) {
      getAllEvents();
    }
  }, [isInitCompleted]);

  const isLoading = useMemo(() => {
    if (!isInitCompleted) {
      return allEvents == null;
    }
    return allEvents == null;
  }, [isInitCompleted, allEvents]);

  const event2Fone = async (element: {
    summary: string;
    endDate: number;
    startDate: number;
    description: string;
    id: string;
    calendar: string;
  }) => {
    // "17018", "来未来&熙牛"
    // "16001", "HBOS"
    const params = {
      title: element.summary,
      project: { value: "17018", label: "来未来&熙牛" },
      product: { value: "16001", label: "HBOS" },
      workHour: ((element.endDate - element.startDate) / (60 * 60 * 1000)).toFixed(1),
      description: element.description,
    };
    const itemId = await createTaskAndEditWeekWork(params);
    if (itemId == null) {
      showToast(Toast.Style.Failure, "Failure", element.summary);
      // success = false;
      return false;
    }
    const taskUrl = "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?workItemId=" + itemId;
    console.log(taskUrl);
    await updateEventUrlById(element.calendar, taskUrl, element.id);
    return true;
  };

  const syncAllEvents = (calendar: string) => {
    let success = true;
    allEvents!.forEach(async (element) => {
      if (element.calendar == calendar) {
        success = await event2Fone(element);
      }
    });
    if (success) {
      showToast(Toast.Style.Success, "Success", "Sync Calendar Event To Fone Tasks Success");
    } else {
      showToast(Toast.Style.Failure, "Failure", "失败了请检查日历与FONEß");
    }
  };

  const syncOneEvent = (id: string) => {
    let success = true;
    allEvents!.forEach(async (element) => {
      if (element.id == id) {
        success = await event2Fone(element);
      }
    });
    if (success) {
      showToast(Toast.Style.Success, "Success", "Sync Calendar Event To Fone Tasks Success");
    } else {
      showToast(Toast.Style.Failure, "Failure", "失败了请检查日历与FONEß");
    }
  };

  return (
    <List
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action
            title="同步 Fone Calendar"
            icon={Icon.Circle}
            onAction={() => {
              syncAllEvents("Fone");
            }}
          />
          <Action
            title="同步 Ding Calendar"
            icon={Icon.Circle}
            onAction={() => {
              syncAllEvents("我的日历（钉钉）");
            }}
          />
        </ActionPanel>
      }
    >
      <List.Item
        key={"sync fone calendar"}
        title={"同步三天内的 Fone 日历到 Fone 网站中"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={() => {
                syncAllEvents("Fone");
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        key={"sync ding calendar"}
        title={"同步一天内的钉钉日历到 Fone 网站中"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={() => {
                syncAllEvents("我的日历（钉钉）");
              }}
            />
          </ActionPanel>
        }
      />

      {allEvents?.map((event) => (
        <List.Item
          key={event.id}
          title={event.summary || "Untitled"}
          subtitle={new Date(event.startDate).toLocaleString() + "  " + event.calendar || ""}
          icon={{ source: Icon.CircleEllipsis, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action
                title="同步这一条"
                icon={Icon.Circle}
                onAction={() => {
                  syncOneEvent(event.id)
                  const all = allEvents?.filter((item) => item.id !== event.id);
                  setAllEvents(all);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
};

export default SyncEvent;
