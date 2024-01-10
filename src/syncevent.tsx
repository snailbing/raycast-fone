import { showToast, Toast, getPreferenceValues, List, Action, ActionPanel, Color, Icon } from "@raycast/api";
import React, { useEffect, useMemo, useState } from "react";
import { add2ThisWeekAndEditWorkHour, changTaskStateToCancel, changTaskStateToComplated, createTaskAndEditWeekWork, getThisWeekRelationIdByItemId, Preferences } from "./service/foneApi";
import useStartApp from "./hooks/useStartApp";
import {
  addFoneUrl2TickTask,
  findTickFoneCompletedUnSyncTask,
  findTickFoneUnSyncTask,
  getFoneItemIdByTickTask,
  taskFoneIsCompleted,
  taskFoneIsCreated,
  tickTaskIsCancle,
  tickTaskIsCompleted,
  updateTickTaskAssignee,
} from "./service/tickApi";
import { projectDic } from "./create";

const SyncEvent: React.FC<Record<string, never>> = () => {
  const [allEvents, setAllEvents] = useState<any[] | null>(null);
  const { isInitCompleted } = useStartApp();

  const { projectId, workHour } = getPreferenceValues<Preferences>();

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

  const tick2Fone = async (element: any) => {
    // "17018", "来未来&熙牛"
    // "16001", "HBOS"

    let projectInfo = { value: "17018", label: "来未来&熙牛" };
    if (element.tags) {
      projectDic.forEach((value, key) => {
        if (value.toUpperCase().includes(element.tags[0].toUpperCase())) {
          projectInfo.value = key;
          projectInfo.label = value;
          return;
        }
      });
    }

    const params = {
      title: element.title,
      project: projectInfo,
      product: { value: "16007", label: "天台HIS" },
      workHour: workHour,
      description: element.content,
    };
    const itemId = await createTaskAndEditWeekWork(params);
    if (itemId == null) {
      console.log("创建 FONE 任务失败" + element.title);
      return itemId;
    }
    const taskUrl = "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?workItemId=" + itemId;
    console.log("添加urltotick: " + taskUrl);
    await addFoneUrl2TickTask(element, taskUrl);
    return itemId;
  };

  const syncOneEvent2Fone = async (task: any) => {
    if (tickTaskIsCompleted(task)) {
      if (!taskFoneIsCompleted(task)) {
        // 还有可能在FONE上都没有创建的
        let itemId = null;
        let foneTaskIsCreated = taskFoneIsCreated(task);
        if (!foneTaskIsCreated) {
          console.log("滴答清单已经完成,但FONE上还没有的");
          itemId = await tick2Fone(task);
        }
        // 获得ID
        if (!itemId) {
          itemId = getFoneItemIdByTickTask(task);
        }
        if (!itemId) {
          console.log("没有获取到ItemId");
          return;
        }
        console.log("获得itemId " + itemId);
        if(foneTaskIsCreated){
          const relationId = await getThisWeekRelationIdByItemId(itemId);
          console.log("判断任务是不是添加到本周收藏里，关联 ID：" + relationId)
          if (!relationId) {
            // 还有一种可能，FONE 上是已经创建了任务，但是历史创建的没有加到本周的工作中，那这儿处理
            await add2ThisWeekAndEditWorkHour(itemId, task.content, workHour);
          }
        }
        await changTaskStateToComplated(itemId);
        // await completedTickTask(task, itemId);
        await updateTickTaskAssignee(task, itemId);
      } else {
        showToast(Toast.Style.Failure, "Failure", "已经完成的暂不支持再同步");
      }
      return;
    } else if (tickTaskIsCancle(task)) {
      // 已经取消的
      // 还有可能在FONE上都没有创建的
      let itemId = null;
      if (!taskFoneIsCreated(task)) {
        console.log("滴答清单已经完成,但FONE上还没有的");
        itemId = await tick2Fone(task);
      }
      // 获得ID
      if (!itemId) {
        itemId = getFoneItemIdByTickTask(task);
      }
      if (!itemId) {
        console.log("没有获取到ItemId");
        return;
      }
      console.log("获得itemId " + itemId);
      await changTaskStateToCancel(itemId);
      await updateTickTaskAssignee(task, itemId);
      return;
    }
    const itemId = await tick2Fone(task);

    if (itemId) {
      showToast(Toast.Style.Success, "Success", "Sync Calendar Event To Fone Tasks Success");
    } else {
      // showToast(Toast.Style.Failure, "Failure", "失败了请检查滴答清单与FONE。");
    }
  };

  return (
    <List isLoading={isLoading} filtering={false}>
      <List.Item
        key={"sync tick tasks"}
        title={"列出滴答清单中FONE列表未同步的内容"}
        icon={{ source: Icon.CircleFilled, tintColor: Color.Red }}
        actions={
          <ActionPanel>
            <Action
              title="刷新"
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
              title="刷新"
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
