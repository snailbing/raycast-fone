import got from "got";
import { formatToServerDate } from "../utils/date";

const cookie =
  "t=43A001113F9610FF929A7FD2B9E37F35062D86B403CEFB15B4530564EDA7A2EAF98FE8DEC1D504C5A136FBA6D201C5CDF194970EBDBE64D7CDE80B40E7C0E502E40E18CB96B7BA33555C8DFAEAC655664256F6B515CF4CE07E8CD4122BA82EE17E5881C8DE09837D18F74D85BCEA6D59151002FFD8A511410766933FA30BF206BED1AF8B780AA0DBB3FD0CC4AE5A14E6A772473DE8707950E4A50BD170D67100619F77295F1B5393C31190CEFC02B558; AWSALB=XAPL9/7zI/ya+YBpbMMAh41SMcXXPAO/84boVoMeSR9PS7snOSZu1wg0Z2Go4iJpB9gAJRoazfcnL2cBJ2Jx48IPAVzD6n+c76FBTwscUhRcbRiqXcQhdhv6WQjl; AWSALBCORS=XAPL9/7zI/ya+YBpbMMAh41SMcXXPAO/84boVoMeSR9PS7snOSZu1wg0Z2Go4iJpB9gAJRoazfcnL2cBJ2Jx48IPAVzD6n+c76FBTwscUhRcbRiqXcQhdhv6WQjl";
const client = got.extend({
  headers: {
    authority: "api.dida365.com",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Cookie: cookie,
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

//https://api.dida365.com/api/v2/project/64ae0db63ff3d179eaedba4d/completed?from=&to=&limit=50
export const getTickTasks = async () => {
  const response = await client
    .get("https://api.dida365.com/api/v2/batch/check/0", {
      responseType: "json",
    })
    .json();
  return (response as any).syncTaskBean.update;
};

//   {
//     id: '64ae1c26e3d411099bace36f',
//     projectId: '64ae0db63ff3d179eaedba4d',
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
    return task.projectId === "64ae0db63ff3d179eaedba4d";
  });
  return tasks;
};

export const findTickFoneOneTask = async (foneUrl: string) => {
  let tasks = await getTickFoneTasks();
  for (const task of tasks) {
    if (task.desc === foneUrl) {
      return task;
    }
  }
  return null;
};

export const completedTickFoneTask = async (foneUrl: string) => {
  let task = await findTickFoneOneTask(foneUrl);
  if (task == null) {
    return null;
  }
  console.log("Fone Taks" + JSON.stringify(task))
  task.assignee = 1;
  task.status = 2;
  return updateTickFoneOneTask(task)
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

// {"add":[],"update":[{"items":[],"reminders":[],"exDate":[],"dueDate":null,"priority":0,"isAllDay":false,"creator":1012056940,"focusSummaries":[],"progress":0,"assignee":null,"sortOrder":-4194305,"commentCount":0,"startDate":null,"isFloating":false,"attachments":[],"desc":"","columnId":"64ae1858c359d1099bace222","reminder":"","remindTime":null,"status":0,"projectId":"64ae0db63ff3d179eaedba4d","kind":"TEXT","etag":"s391xzwk","createdTime":"2023-07-12T09:22:46.000+0000","modifiedTime":"2023-07-12T10:17:06.000+0000","title":"跟进余二反馈的麻方问题","tags":["余二"],"timeZone":"Asia/Shanghai","content":"once、用量、医生\n还有过两天要检查了\n","id":"64ae70e6edb3d1099bace469"}],"delete":[],"addAttachments":[],"updateAttachments":[],"deleteAttachments":[]}
export const updateTickFoneTasks = async () => {
  const response = await client
    .post("https://api.dida365.com/api/v2/batch/task", {
      json: {
        add: [],
        addAttachments: [],
        delete: [],
        deleteAttachments: [],
        update: [
          {
            assignee: null,
            attachments: [],
            columnId: "64ae1858c359d1099bace222",
            commentCount: 0,
            content: "once、用量、医生\n还有过两天要检查了\n",
            createdTime: "2023-07-12T09:22:46.000+0000",
            creator: 1012056940,
            desc: "",
            dueDate: null,
            etag: "s391xzwk",
            exDate: [],
            focusSummaries: [],
            id: "64ae70e6edb3d1099bace469",
            isAllDay: false,
            isFloating: false,
            items: [],
            kind: "TEXT",
            modifiedTime: "2023-07-12T10:17:06.000+0000",
            priority: 0,
            progress: 0,
            projectId: "64ae0db63ff3d179eaedba4d",
            remindTime: null,
            reminder: "",
            reminders: [],
            sortOrder: -4194305,
            startDate: null,
            status: 0,
            tags: ["余二"],
            timeZone: "Asia/Shanghai",
            title: "跟进余二反馈的麻方问题",
          },
        ],
        updateAttachments: [],
      },
      responseType: "json",
    })
    .json();
  return response as any;
};

const taskToTickTask = (data: {
  projectId: string;
  title: string;
  description: string;
  foneUrl: string;
  projectName: string;
})=> {
  const date = new Date();
  return {
    assignee: null,
    columnId: null,
    content: data.description,
    desc: data.foneUrl,
    createdTime: formatToServerDate(date),
    dueDate: null,
    exDate: [],
    id: null,
    isAllDay: true,
    isFloating: false,
    items: [],
    kind: null,
    modifiedTime: formatToServerDate(date),
    priority: 0,
    progress: 0,
    projectId: data.projectId,
    reminders: [],
    sortOrder: -1099516870657,
    startDate: formatToServerDate(date),
    status: 0,
    tags: [data.projectName],
    timeZone: "Asia/Shanghai",
    title: data.title,
  }
}

//{"add":[{"items":[],"reminders":[{"id":"64ae8a06104e4d32008f9461","trigger":"TRIGGER:P0DT9H0M0S"}],"exDate":[],"dueDate":null,"priority":0,"isAllDay":true,"progress":0,"assignee":null,"sortOrder":-1099516870657,"startDate":"2023-07-11T16:00:00.000+0000","isFloating":false,"columnId":"64ae1858c359d1099bace222","status":0,"projectId":"64ae0db63ff3d179eaedba4d","kind":null,"createdTime":"2023-07-12T11:09:58.000+0000","modifiedTime":"2023-07-12T11:09:58.000+0000","title":"测试获取tick的创建API与参数","tags":["余二"],"timeZone":"Asia/Shanghai","content":"","id":"64ae8a06104e4d32008f9462"}],"update":[],"delete":[],"addAttachments":[],"updateAttachments":[],"deleteAttachments":[]}
export const addTickFoneTasks = async (data: {
  projectId: string;
  title: string;
  description: string;
  foneUrl: string;
  projectName: string;
}) => {
  const response = await client
    .post("https://api.dida365.com/api/v2/batch/task", {
      json: {
        add: [
          taskToTickTask(data),
        ],
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
