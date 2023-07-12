import { showToast, Toast, getPreferenceValues, List, Action, ActionPanel, Color, Icon } from "@raycast/api";
import React, { useEffect, useMemo, useState } from "react";
import { getCalendarEvents, updateEventUrlById } from "./utils/calendar";
import { createTaskAndEditWeekWork, Preferences } from "./service/foneApi";
import useStartApp from "./hooks/useStartApp";
import { findTickFoneCompletedUnSyncTask, findTickFoneUnSyncTask, updateTickFoneOneTask } from "./service/tickApi";
import { productDic, projectDic } from "./create";

const SyncEvent: React.FC<Record<string, never>> = () => {
  const [allEvents, setAllEvents] = useState<any[] | null>(null);
  const { isInitCompleted } = useStartApp();

  const { projectId } = getPreferenceValues<Preferences>();

  // const getEvents = async (day: any, calendar: string) => {
  //   const sep = day * 24 * 60 * 60 * 1000;
  //   const curDate = new Date();
  //   const endDate = new Date(curDate.getTime() + sep);
  //   const startDate = new Date(curDate.getTime() - sep);
  //   const events = await getCalendarEvents(calendar, startDate, endDate);
  //   return events;
  // };

  useEffect(() => {
    const getAllEvents = async () => {
      // const foneEvents = await getEvents(1, "Fone");
      // setAllEvents(JSON.parse(foneEvents));
      const tickEvents = await findTickFoneUnSyncTask();
      setAllEvents(tickEvents);
    };

    if (isInitCompleted) {
      getAllEvents();
    }
  }, [isInitCompleted]);

  const isLoading = useMemo(() => {
    if (!isInitCompleted) {
      console.log("aaaaaaaaaaa", allEvents == null);
      return allEvents == null;
    }
    console.log("bbbbbbbbb", allEvents == null);
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

  const tick2Fone = async (element: any) => {
    // "17018", "来未来&熙牛"
    // "16001", "HBOS"

    let projectInfo = { value: "17018", label: "来未来&熙牛" };
    if (element.tags) {
      projectDic.forEach((value, key) => {
        if (value == element.tags[0]) {
          projectInfo.value = key;
          projectInfo.label = value;
          return;
        }
      });
    }

    const params = {
      title: element.title,
      project: projectInfo,
      product: { value: "16001", label: "HBOS" },
      workHour: "1",
      description: element.content,
    };
    const itemId = await createTaskAndEditWeekWork(params);
    if (itemId == null) {
      showToast(Toast.Style.Failure, "Failure", element.summary);
      // success = false;
      return false;
    }
    const taskUrl = "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?workItemId=" + itemId;
    console.log(taskUrl);
    element.desc = taskUrl;
    element.content = element.content + "\n" + taskUrl;
    await updateTickFoneOneTask(element);
    return true;
  };

  const syncOneEvent2Fone = async (task: any) => {
    // task.assignee &&
    if (task.status == 2) {
      showToast(Toast.Style.Failure, "Failure", "已经完成的暂不支持再同步");
      return;
    }
    const success = await tick2Fone(task);

    if (success) {
      showToast(Toast.Style.Success, "Success", "Sync Calendar Event To Fone Tasks Success");
    } else {
      showToast(Toast.Style.Failure, "Failure", "失败了请检查滴答清单与FONEß");
    }
  };

  return (
    <List isLoading={isLoading} filtering={false}>
      {/* <List.Item
        key={"sync there day fone calendar"}
        title={"列出前后三天内的 Fone 日历内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={async () => {
                setAllEvents(null);
                const foneEvents = await getEvents(3, "Fone");
                setAllEvents(JSON.parse(foneEvents));
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        key={"sync two day fone calendar"}
        title={"列出前后二天内的 Fone 日历内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={async () => {
                setAllEvents(null);
                const foneEvents = await getEvents(2, "Fone");
                setAllEvents(JSON.parse(foneEvents));
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        key={"sync one day fone calendar"}
        title={"列出前后一天内的 Fone 日历内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={async () => {
                setAllEvents(null);
                const foneEvents = await getEvents(1, "Fone");
                setAllEvents(JSON.parse(foneEvents));
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        key={"sync ding calendar"}
        title={"列出前后半天内的钉钉日历内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={async () => {
                setAllEvents(null);
                const foneEvents = await getEvents(0.5, "我的日历（钉钉）");
                setAllEvents(JSON.parse(foneEvents));
              }}
            />
          </ActionPanel>
        }
      /> */}

      <List.Item
        key={"sync tick tasks"}
        title={"列出滴答清单中FONE列表未同步的内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={async () => {
                setAllEvents(null);
                const tickEvents = await findTickFoneUnSyncTask();
                console.log(tickEvents);
                setAllEvents(tickEvents);
              }}
            />
          </ActionPanel>
        }
      />

      <List.Item
        key={"sync tick completed tasks"}
        title={"列出滴答清单中FONE列表已完成但未同步的内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="同步"
              icon={Icon.Circle}
              onAction={async () => {
                setAllEvents(null);
                const tickEvents = await findTickFoneCompletedUnSyncTask();
                console.log(tickEvents);
                setAllEvents(tickEvents);
              }}
            />
          </ActionPanel>
        }
      />

      {allEvents?.map((event) => (
        <List.Item
          key={event.id}
          title={event.title || "Untitled"}
          subtitle={event.tags ? event.tags[0] : ""}
          icon={{ source: Icon.CircleEllipsis, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action
                title="同步"
                icon={Icon.Circle}
                onAction={() => {
                  syncOneEvent2Fone(event);
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
