import got from "got";
import { formatToServerDate } from "../utils/date";
import { getPreferenceValues } from "@raycast/api";
import { Fone_Task_Prefix, Preferences } from "./foneApi";

// const tickCookie =
// "t=43A001113F9d610FF929A7FD2B9E37F35062D86B403CEFB15B4530564EDA7A2EAF98FE8DEC1D504C5A136FBA6D201C5CDF194970EBDBE64D7CDE80B40E7C0E502E40E18CB96B7BA33555C8DFAEAC655664256F6B515CF4CE07E8CD4122BA82EE17E5881C8DE09837D18F74D85BCEA6D59151002FFD8A511410766933FA30BF206BED1AF8B780AA0DBB3FD0CC4AE5A14E6A772473DE8707950E4A50BD170D67100619F77295F1B5393C31190CEFC02B558; AWSALB=XAPL9/7zI/ya+YBpbMMAh41SMcXXPAO/84boVoMeSR9PS7snOSZu1wg0Z2Go4iJpB9gAJRoazfcnL2cBJ2Jx48IPAVzD6n+c76FBTwscUhRcbRiqXcQhdhv6WQjl; AWSALBCORS=XAPL9/7zI/ya+YBpbMMAh41SMcXXPAO/84boVoMeSR9PS7snOSZu1wg0Z2Go4iJpB9gAJRoazfcnL2cBJ2Jx48IPAVzD6n+c76FBTwscUhRcbRiqXcQhdhv6WQjl";
// const tickProjectId = "64ae0db63ff3d179eaedba4d"
const { tickCookie, tickProjectId } = getPreferenceValues<Preferences>();
const client = got.extend({
  headers: {
    authority: "api.dida365.com",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Cookie: tickCookie,
    hl: "zh_CN",
    Origin: "https://dida365.com",
    Referer: "https://dida365.com/",
    "sec-ch-ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "macOS",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    traceid: "64ae35bf104e4d0da6c1f583",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "x-device":
      '{"platform":"web","os":"macOS 10.15.7","device":"Chrome 114.0.0.0","name":"","version":4561,"id":"61db9938e636e25705398cc2","channel":"website","campaign":"","websocket":"64ae35be104e4d0da6c1f525"}',
    "x-tz": "Asia/Shanghai",
  },
});

export const getTickTasks = async () => {
  const response = await client
    .get("https://api.dida365.com/api/v2/batch/check/0", {
      responseType: "json",
    })
    .json();
  return (response as any).syncTaskBean.update;
};

export const getTickCompletedTasks = async () => {
  const response = await client
    .get("https://api.dida365.com/api/v2/project/" + tickProjectId + "/completed?from=&to=&limit=50", {
      responseType: "json",
    })
    .json();
  return response as any;
};

//   {
//     id: '64ae1c26e3d411099bace36f',
//     projectId: tickProjectId,
//     sortOrder: -1048577,
//     title: '跟进仓前反馈0.125的药打印显示成0.13',
//     content: '确定是前端还是后端的精度总理',
//     desc: '',
//     timeZone: 'Asia/Shanghai',
//     isFloating: false,
//     isAllDay: false,
//     reminder: '',
//     reminders: [],
//     exDate: [],
//     priority: 0,
//     status: 0,
//     items: [],
//     progress: 0,
//     modifiedTime: '2023-07-12T05:06:56.000+0000',
//     etag: 'u4irur8k',
//     deleted: 0,
//     createdTime: '2023-07-12T03:21:10.000+0000',
//     creator: 1012056940,
//     attachments: [],
//     commentCount: 0,
//     focusSummaries: [],
//     columnId: '64ae1858c359d1099bace222',
//     kind: 'TEXT'
//   },
export const getTickFoneTasks = async () => {
  let tasks = await getTickTasks();
  tasks = tasks.filter((task: any) => {
    return task.projectId == tickProjectId;
  });
  return tasks;
};

export const findTickFoneOneTaskByUrl = async (foneUrl: string) => {
  let tasks = await getTickFoneTasks();
  for (const task of tasks) {
    if (isTheTaskByFoneUrl(task, foneUrl)) {
      return task;
    }
  }
  return null;
};

export const findTickFoneUnSyncTask = async () => {
  let tasks = await getTickFoneTasks();
  tasks = tasks.filter((task: any) => {
    return !taskFoneIsCreated(task);
  });
  return tasks;
};

export const findTickFoneAssigneeTask = async () => {
  let tasks = await getTickFoneTasks();
  tasks = tasks.filter((task: any) => {
    return task.assignee;
  });
  return tasks;
};

export const tickTaskIsAssignee = (task: any) => {
  if (task == null) {
    return false;
  }
  return task.assignee;
};

export const findTickFoneCompletedUnSyncTask = async () => {
  let tasks = await getTickCompletedTasks();
  tasks = tasks.filter((task: any) => {
    return !task.assignee || task.assignee == "";
  });
  return tasks;
};

export const completedTickFoneTask = async (foneUrl: string, id: number) => {
  let task = await findTickFoneOneTaskByUrl(foneUrl);
  if (task == null) {
    // 有可能是在完成列表里了
    console.log("没有找到对应的滴答" + foneUrl);
    const tasks = await findTickFoneCompletedUnSyncTask();
    for (const aTask of tasks) {
      if (isTheTaskByFoneUrl(aTask, foneUrl)) {
        task = aTask;
        break;
      }
    }
    if (task == null) {
      console.log("还是没有找到对应的滴答" + foneUrl);
      return null;
    }
  }
  console.log("Fone Taks" + JSON.stringify(task));
  return completedTickTask(task, id);
};

export const completedTickTask = async (task: any, id: number) => {
  task.assignee = id ? id : 1;
  task.status = 2;
  return updateTickFoneOneTask(task);
};

export const updateTickTaskAssignee = async (task: any, id: number) => {
  task.assignee = id ? id : 1;
  return updateTickFoneOneTask(task);
};

export const clearTickTaskAssignee = async (task: any) => {
  // task.assignee = undefined;
  task.assignee = 0;
  return updateTickFoneOneTask(task);
};

const isTheTaskByFoneUrl = (task: any, foneUrl: string) => {
  if (!task) {
    return false;
  }
  if (task.desc == foneUrl || task.content.includes(foneUrl)) {
    return true;
  }
};

export const tickTaskIsCompleted = (task: any) => {
  if (task == null) {
    return false;
  }
  return task.status == 2;
};

/**
 * 这个 tick 任务是已经取消的
 * @param task 
 * @returns 
 */
export const tickTaskIsCancle = (task: any) => {
  if (task == null) {
    return false;
  }
  return task.status == -1;
};

export const taskFoneIsCreated = (task: any) => {
  if (task == null) {
    return false;
  }
  return task.desc || task.content.includes(Fone_Task_Prefix);
};

export const taskFoneIsCompleted = (task: any) => {
  if (task == null) {
    return false;
  }
  return task.status == 2 && task.assignee;
};

export const addFoneUrl2TickTask = async (task: any, foneUrl: string) => {
  task.desc = foneUrl;
  task.content = task.content + "\n" + foneUrl;
  await updateTickFoneOneTask(task);
};

// "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?workItemId=" + itemId;
export const getFoneItemIdByTickTask = (task: any) => {
  if (!task) {
    return null;
  }
  let content = task.desc;
  if (!content) {
    content = task.content;
  }
  if (!content) {
    return null;
  }
  const spe = content.split("?workItemId=");
  if (spe.length >= 2) {
    content = spe[1];
    if (content.includes("\n")) {
      content = content.split("\n")[0];
    }
    return content;
  }
  return null;
};

export const updateTickFoneOneTask = async (task: any) => {
  const response = await client
    .post("https://api.dida365.com/api/v2/batch/task", {
      json: {
        add: [],
        addAttachments: [],
        delete: [],
        deleteAttachments: [],
        update: [task],
        updateAttachments: [],
      },
      responseType: "json",
    })
    .json();
  return response as any;
};

const taskToTickTask = (data: { title: string; description: string; foneUrl: string; projectName: string }) => {
  let tag = data.projectName;
  if (tag.includes("/")) {
    tag = tag.split("/")[0];
  }
  const date = new Date();
  return {
    assignee: null,
    columnId: null,
    content: data.description + "\n" + data.foneUrl,
    desc: data.foneUrl,
    createdTime: formatToServerDate(date),
    dueDate: null,
    exDate: [],
    id: null,
    isAllDay: false,
    isFloating: false,
    items: [],
    kind: "TEXT",
    modifiedTime: formatToServerDate(date),
    priority: 0,
    progress: 0,
    projectId: tickProjectId,
    reminders: [],
    // sortOrder: -1099516870657,
    sortOrder: null,
    startDate: formatToServerDate(date),
    status: 0,
    tags: [tag],
    timeZone: "Asia/Shanghai",
    title: data.title,
  };
};

export const addTickFoneTasks = async (data: {
  title: string;
  description: string;
  foneUrl: string;
  projectName: string;
}) => {
  const response = await client
    .post("https://api.dida365.com/api/v2/batch/task", {
      json: {
        add: [taskToTickTask(data)],
        addAttachments: [],
        delete: [],
        deleteAttachments: [],
        update: [],
        updateAttachments: [],
      },
      responseType: "json",
    })
    .json();
  return response as any;
};
