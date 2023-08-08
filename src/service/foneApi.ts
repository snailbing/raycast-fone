import { showToast, Toast, getPreferenceValues } from "@raycast/api";
import { Project } from "./project";
import { Task } from "./task";
import { runAppleScript } from "run-applescript";
import { convertMacTime2JSTime, getSectionNameByDate } from "../utils/date";
import got from "got";

const taskObject2Task = (object: Record<string, any>): Task => {
  return {
    id: object.id as Task["id"],
    title: object.title as Task["title"],
    content: object.content as Task["content"],
    desc: object.desc as Task["desc"],
    priority: object.prioritySort as Task["prioritySort"],
    projectId: object.projectId as Task["projectId"],
    bizProjectId: object.project.value as Task["project"]["value"],
    bizProjectName: object.project.label as Task["project"]["label"],
    state: object.state.label as Task["state"]["label"],
    // items: object.items as Task["items"],
    // kind: object.kind as Task["kind"],
    // tags: (object.tags || []) as Task["tags"],
  };
};

const projectObject2Project = (object: Record<string, unknown>): Project => {
  return {
    id: object.id as string,
    name: object.projectName as string,
  };
};

const errorHandler = (err: unknown) => {
  console.log("parse error", err);
  showToast(Toast.Style.Failure, "Something went wrong");
};

const getDateListData = async (command: string) => {
  try {
    const result = (await runAppleScript(command)) as string;
    if (result === "missing value") {
      return [];
    }
    const parsedResult = JSON.parse(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parsedResult.map((section: any) => {
      if (section.id === "note") {
        return {
          id: "note",
          name: "Note",
          children: section.tasks.map(taskObject2Task),
        };
      }
      return {
        id: `date-${section.date}`,
        name: getSectionNameByDate(new Date(convertMacTime2JSTime(section.date))),
        children: section.tasks.map(taskObject2Task),
      };
    });
  } catch (e) {
    errorHandler(e);
    return [];
  }
};

export type Preferences = {
  projectId: string;
  userId: string;
  userName: string;
  cookie: string;
  tickCookie: string;
  tickProjectId: string;
  workHour: string;
};

// projectId = 173746
// userName = 张正伟
// userId = "1396655535033933826"
// cookie = "_bl_uid=hql8bdwksX3uhzzt242pg5twOwps; prod_c2f_token=YzJmOjNlN2E3ZTQ4OTBhMzQ3OWNiYzIxNTBlZjZhZThkZDli.a2VsZXUaHQlEukDvxzDAFxuU6si/01vNdzLMT6ya7QjvN3FsGIQOUqTEBA5CSnegBnjIFjh5tpEXu7Aes0QxmB2nO6fe8r6tzzlS+Qxzl3Fd+PUxgu3twjMqn4D/cjxtPMZg98CTep9V3TUkTRj4CwtnnbCHVfdn0aS4gMVETrvqfNwZmqIqWpmMtF4PTERqkezI8mK2qTsOM1SzBAsjjz1Y5tocp8Trd3ZFrbuSIN3UBdtX3sHpUfjSboZ2fwwV+suU1P+fWykffVpiiG5zLgHb068yC9Cuzn+NTIG9QMvQaRDnaVQYi4fRHnMSy3R2VZg9bGT+l0Q5qvXLIh6GPixWXR7uiDEyHiE4zETVJYmWVks9dFVI/BCXKl0Y75k6XnBYUjZ7sHDMPt+MrCCwcU8ysTgeR8Lbtffc8vYHZXx8OnwbILMBzXwR3vOyaERAGFMC2teUP1eSvxT4bZj9MUZo4p1i/s/RfZrG/BhBLJGZCi13KT8sYB1QrG4kpjRxm2Q9EZap8lkGR7gaOupsjnkrwqSiE0xSHml1y1T0uBauyWSalPQ3fRN6t+qZSWFhHiUqx6WfkRC12aZ+FPp0XsTJ/WP6WYTRxrNXHhSuwRiMMU7rqmczDbGWZr0q3XFsXmLQU7UFO1NkiMROeF5yiMFpw98ntB4RrchsJanoiUkxRw0xlzO+lKxDPHNzVy6yk6HcHpH5/GwnzCeb; prod_hbos_token=YzJmOjNlN2E3ZTQ4OTBhMzQ3OWNiYzIxNTBlZjZhZThkZDli.a2VsZXUaHQlEukDvxzDAFxuU6si/01vNdzLMT6ya7QjvN3FsGIQOUqTEBA5CSnegBnjIFjh5tpEXu7Aes0QxmB2nO6fe8r6tzzlS+Qxzl3Fd+PUxgu3twjMqn4D/cjxtPMZg98CTep9V3TUkTRj4CwtnnbCHVfdn0aS4gMVETrvqfNwZmqIqWpmMtF4PTERqkezI8mK2qTsOM1SzBAsjjz1Y5tocp8Trd3ZFrbuSIN3UBdtX3sHpUfjSboZ2fwwV+suU1P+fWykffVpiiG5zLgHb068yC9Cuzn+NTIG9QMvQaRDnaVQYi4fRHnMSy3R2VZg9bGT+l0Q5qvXLIh6GPixWXR7uiDEyHiE4zETVJYmWVks9dFVI/BCXKl0Y75k6XnBYUjZ7sHDMPt+MrCCwcU8ysTgeR8Lbtffc8vYHZXx8OnwbILMBzXwR3vOyaERAGFMC2teUP1eSvxT4bZj9MUZo4p1i/s/RfZrG/BhBLJGZCi13KT8sYB1QrG4kpjRxm2Q9EZap8lkGR7gaOupsjnkrwqSiE0xSHml1y1T0uBauyWSalPQ3fRN6t+qZSWFhHiUqx6WfkRC12aZ+FPp0XsTJ/WP6WYTRxrNXHhSuwRiMMU7rqmczDbGWZr0q3XFsXmLQU7UFO1NkiMROeF5yiMFpw98ntB4RrchsJanoiUkxRw0xlzO+lKxDPHNzVy6yk6HcHpH5/GwnzCeb; c2f_prod_c2f_token=YzJmOjhiYTJkZjNkOWI4YTRmNGJhM2E1YzhlZmI1YTA4NzZl.a2VsZWmUW7Virhh/CGWFAdc9nxQOaoyoKyT2+py3Bx9lqeicu9j0J3+BsJgvWPDIScWe+lBt97mZWG2Mmvpb/LGC80+iuG7HqTss6Fr9E5h60+v7UYdsVRiQYy1ZewxaitmYyMQY9vQizAnmiQXr9fN/zDBRY9fH07W6TBH5nWftMIO6+Uba93pKfU22yct6QHR7EcJLRIHK/7MnfZvFIpMnjoWoj2wIXmWJ0d4blV51Xvd2YBd4OBG9FpOzDaNpINr+rwtaod0PqfOLmow9PymAkhbvXXxdxAFcXscbZoFBit4OGJx9lrxR8CbPOEsTotrxm5sQgqpqSqij1JJDGZHimB8kyx7It+hi8nG2Duyviwt00Q3qM0dKZ3l0HsCJ2fks14yXyz3JxyGGm5PCbMi+zGl7tcAFScjPzWaVFIBj1wL3hBe75ELc799z5mBBU1g5GkzxldInNWQTnIgr+vurg+QaDmYMwFzbF0kCaH0E/gEpboibvF1eHDfAQE1SVjGf70H23aNJP+sMHWmndkZlPkCCiRBsM6Q06pj4sYSghhY4QGAv47zMwPM2anysGosUPJ8cJwzcgEWxQFFOPruhSfqpH2iXCtKKSWo5mGiM0nXjq5Qv3NGg3uwJGXTLdX6rI4yrANI4W0FLkHp7yabdyltwXcW2TnGWv5mjuClW7B+iGQ+M29/ocOefxSmbRW1nRTdkUPmSPfnG; c2f_prod_hbos_token=YzJmOjhiYTJkZjNkOWI4YTRmNGJhM2E1YzhlZmI1YTA4NzZl; acw_tc=5e5760221678622517263113559ee22072b33258c24d1b3ee67685f9be902d"
const { projectId, userId, userName, cookie } = getPreferenceValues<Preferences>();

const client = got.extend({
  headers: {
    Accept: "application/json",
    "Accept-Language": "zh-CN,zh;q=0.9",
    Connection: "keep-alive",
    "Content-Type": "application/json; charset=UTF-8",
    Cookie: cookie,
    Origin: "https://fone.come-future.com",
    Referer: "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?state=%5B%221%22%2C%224%22%5D",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
  },
});

const getFoneTasks = async (keyword?: string | null) => {
  var query: { state: string[]; title?: string } = { state: ["1", "4"] };
  if (keyword) {
    query.title = keyword;
  }
  const response = await client
    .post("https://fone.come-future.com/eip-fone/workItem/memoryPage", {
      json: {
        type: 3,
        fieldSource: 3,
        projectId: projectId,
        queryWrapper: query,
        current: 1,
        pageSize: 200,
        viewType: 1,
      },
      responseType: "json",
    })
    .json();
  return (response as any).data.records;
};

export const getToday = async () => {
  // return getFoneTasks(null);
  return getSearchByKeyword(null);
};

export const getSearchByKeyword = async (keyword: string | null) => {
  try {
    const result = await getFoneTasks(keyword);
    if (!result || result.length == 0) {
      return [];
    }
    var parsedResult = result;
    var i = 0;
    result.forEach((item: any) => {
      i = i + 1;
      if (item.children && item.children.length > 0) {
        // parsedResult.push(...item.children)
        parsedResult.splice.apply(parsedResult, [i, 0].concat(item.children));
      }
    });

    return parsedResult.map(taskObject2Task);
  } catch (e) {
    errorHandler(e);
    return [];
  }
};

export const getProjectTree = async () => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/dictionary/getProjectTree", {
      json: {},
      responseType: "json",
    })
    .json();
  return (response as any).data;
};

export const getProjects = async () => {
  try {
    const result = await getProjectTree();
    if (!result || result.length == 0) {
      return [];
    }

    const parsedResult = result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects: Project[] = parsedResult.map((project: any) => {
      return projectObject2Project(project);
    });
    return projects;
  } catch (e) {
    errorHandler(e);
    return [];
  }
};

export const createTask = async (params: any) => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/workItem/create", {
      json: {
        fields: {
          title: params["title"],
          project: params["project"],
          product: params["product"],
          // job: [{ label: "交付团队", value: "10009" }],
          job: [{ label: "研发团队", value: "10007" }],
          // 任务责任人，张九
          principalId: userId,
          reporter: null,
          priority: null,
          workHour: params["workHour"],
          description: params["description"],
          workitemTypeId: { label: "通用任务", value: "10040008" },
          planStartTime: null,
          planEndTime: null,
          startTime: null,
          endTime: null,
          projectId: projectId,
        },
        workitemType: 3,
      },
      responseType: "json",
    })
    .json();
  return response as any;
};

export const changTaskStateToComplated = async (taskId: string) => {
  return changTaskState(taskId, "36");
};

/**
 * Fone 的任务取消
 * @param taskId 
 * @returns 
 */
export const changTaskStateToCancel = async (taskId: string) => {
  return changTaskState(taskId, "32");
};

/**
 * 修改任务状态
 * @param projectId
 * @param taskId
 * @param state 1:未开始；4：进行中；32:已取消；36:已完成
 * @returns
 */
export const changTaskState = async (taskId: string, state: string) => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/workItem/editState", {
      json: {
        workItemId: taskId,
        state: state,
        currentUserId: userId,
        comment: "Raycast 操作",
        currentUserName: userName,
      },
      responseType: "json",
    })
    .json();
  return response as any;
};

export const addToThisWeek = async (itemId: string) => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/view/addItem", {
      json: {
        collectChildRequirement: false,
        collectChildTask: false,
        viewId: "0",
        itemIds: [itemId],
      },
      responseType: "json",
    })
    .json();
  return response as any;
};

export const getCurrentWeekId = async () => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/view/cycleList", {
      json: {},
      responseType: "json",
    })
    .json();
  return response as any;
};

export const getThisWeekList = async (cycldId: string) => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/view/listItem", {
      json: {
        cycleId: cycldId,
        viewId: "0",
      },
      responseType: "json",
    })
    .json();
  let data = (response as any).data;
  const items = new Map<string, string>();
  data.map((item: any) => {
    items.set(item.id, item.relationId);
  });
  return items;
};

export const editThisWeekItem = async (relationId: string, remark: string, workHour: string) => {
  const response = await client
    .post("https://fone.come-future.com/eip-fone/view/editItem", {
      json: {
        relationId: relationId,
        remark: remark,
        workHour: workHour,
      },
      responseType: "json",
    })
    .json();
  return response as any;
};

export const createTaskAndEditWeekWork = async (params: any) => {
  const response = await createTask(params);

  if (response && response.success == true) {
    let itemId = response.data.id;
    await addToThisWeek(itemId);
    const currentWeekResponse = await getCurrentWeekId();
    let currentWeekData = (currentWeekResponse as any).data;
    let weekId = "";
    const timeInterval = new Date().getTime();
    currentWeekData.map((item: any) => {
      /*
          cycleCode:"2023:18"
          cycleTitle:"2023年第18周0424-0430"
          endTime:"2023-04-30 23:59:59"
          id:"10002001"
          sortIndex:null
          startTime:"2023-04-24 00:00:00"
          */
      let tempStart = new Date(item.startTime).getTime();
      let tempStop = new Date(item.endTime).getTime();
      if (tempStart! < timeInterval && timeInterval < tempStop!) {
        weekId = item.id;
        return;
      }
    });

    const items = await getThisWeekList(weekId);
    const relationId = items.get(itemId) as string;
    await editThisWeekItem(relationId, params.description, params.workHour);

    return itemId;
  }

  return null;
};
