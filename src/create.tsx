import {
  ActionPanel,
  Form,
  Icon,
  showToast,
  Toast,
  Action,
  Clipboard,
  getPreferenceValues,
  closeMainWindow,
  PopToRootType,
} from "@raycast/api";
import { createTaskAndEditWeekWork, Preferences } from "./service/foneApi";
import { setTimeout } from "timers";
import { addTickFoneTasks } from "./service/tickApi";

const { projectId, workHour } = getPreferenceValues<Preferences>();

export const projectDic = new Map<string, string>([
  // ["21005", "浙一项目-金刚电子病历"],
  // ["17001", "浙一项目--未来医院"],
  ["32002", "浙一项目--5G+重症&国保/大HIS"],
  ["32004", "上海中山项目--老年医学中心项目/大HIS"],
  ["32006", "富阳中医骨伤项目/大HIS"],
  ["32008", "余杭二院、三院、良渚医院数据及业务中台项目/大HIS"],
  // ["17040", "余杭二院、三院、良渚医院数据及业务中台项目"],
  // ["17014", "上海中山项目--老年医学中心项目"],
  ["25001", "上海中山佘山院区项目"],
  ["17004", "天台--医共体信息化建设"],
  ["35005", "桂林医学院信息化建设项目/大HIS"],
  ["17018", "来未来&熙牛"],
]);

export const productDic = new Map<string, string>([
  ["35005", "金刚电子病历"],
  // ["17011", "护理中心"],
  ["17021", "住院"],
  ["16001", "HBOS"],
  ["16006", "浙一HIS"],
]);

const gnNode = (myMap: Map<string, string>) => {
  let nodes: React.ReactNode[] = [];
  myMap.forEach((value, key) => {
    nodes.push(<Form.Dropdown.Item key={key} value={key} title={value} />);
  });
  return nodes;
};

export default function Command() {
  return (
    <Form
      actions={
        <ActionPanel>
          <CreateTaskAction />
          <Action.OpenInBrowser
            title="Open Fone Create"
            url={"https://fone.come-future.com/fone/projectDetail/task/" + projectId}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="标题" placeholder="Enter task title ..." />

      <Form.Dropdown id="project" title="所属项目" storeValue={true}>
        {gnNode(projectDic)}
      </Form.Dropdown>

      <Form.Dropdown id="product" title="所属产品模块" storeValue={true}>
        {gnNode(productDic)}
      </Form.Dropdown>

      <Form.TextField id="workHour" title="工时(H)" placeholder="输入明确的或预期工时..." defaultValue={workHour} />
      <Form.TextArea id="description" title="内容" placeholder="Enter task content ..." />
    </Form>
  );
}

function CreateTaskAction() {
  async function handleSubmit(values: {
    title: string;
    product: string;
    project: string;
    workHour: string;
    description: string;
  }) {
    if (!values.title) {
      showToast({
        style: Toast.Style.Failure,
        title: "Title is required",
      });
      return;
    }

    const params = {
      title: values.title,
      project: { value: values.project, label: projectDic.get(values.project) },
      product: { value: values.product, label: productDic.get(values.product) },
      workHour: values.workHour,
      description: values.description,
    };

    const toast = await showToast({ style: Toast.Style.Animated, title: "Create Fone Task" });

    try {
      console.log("开始创建Fone" + JSON.stringify(params))
      const itemId = await createTaskAndEditWeekWork(params);

      if (itemId != null) {
        const taskUrl = "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?workItemId=" + itemId;
        await Clipboard.copy(taskUrl);

        // 创建本地的日历
        // const timeInterval = new Date().getTime();
        // const event: CalendarEvent = {
        //   id: taskUrl,
        //   eventTitle: params.title,
        //   desc: params.description,
        //   startDate: new Date(timeInterval),
        //   endDate: new Date(timeInterval + Number(params.workHour) * 60 * 60 * 1000),
        //   validated: true,
        //   isAllDay: false,
        //   url: taskUrl,
        //   product: params.project.label + "/" + params.product.label,
        // };
        // createCalendarEvent(event, "Fone");

        // // 本地创建滴答清单 Fone
        // addTickTickTask({
        //   projectId: tickProjectId,
        //   title: params.title,
        //   description: params.description,
        //   // dueDate?: new Date(timeInterval),
        //   isAllDay: false,
        // });

        // 网络创建滴答清单 Fone
        const res = await addTickFoneTasks({
          title: params.title,
          description: params.description,
          foneUrl: taskUrl,
          projectName: params.project.label as string,
        })
        console.log("添加滴答清单" + JSON.stringify(res))

        toast.style = Toast.Style.Success;
        toast.title = "Create Task";
        toast.message = "Copied link to clipboard";
        setTimeout(() => {
          // popToRoot({ clearSearchBar: true });
          closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
        }, 1000);
      } else {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed create Task";
      }
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed create Task";
      toast.message = String(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Create Task" onSubmit={handleSubmit} />;
}
