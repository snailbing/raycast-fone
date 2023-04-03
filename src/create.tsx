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
import { createTask, Preferences } from "./service/foneApi";
import { setTimeout } from "timers";

const { projectId } = getPreferenceValues<Preferences>();

const projectDic = new Map<string, string>([
  ["21005", "浙一项目-金刚电子病历"],
  ["17001", "浙一项目--未来医院"],
  ["32006", "富阳中医骨伤项目/大HIS"],
  ["17040", "余杭二院、三院、良渚医院数据及业务中台项目"],
  ["17014", "上海中山项目--老年医学中心项目"],
  ["25001", "上海中山佘山院区项目"],
  ["17004", "天台--医共体信息化建设"],
  ["17018", "来未来&熙牛"],
]);

const productDic = new Map<string, string>([
  ["35005", "金刚电子病历"],
  ["17011", "护理中心"],
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

      <Form.TextField id="workHour" title="工时(H)" placeholder="输入明确的或预期工时..." />
      <Form.TextArea id="description" title="内容" placeholder="Enter task content ..." />
    </Form>
  );
}

function CreateTaskAction() {
  async function handleSubmit(values: { title: string; product: string; project: string; workHour:string; description: string }) {
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
      const response = await createTask(params);

      if (response && response.success == true) {
        await Clipboard.copy("https://fone.come-future.com/fone/projectDetail/task/" + projectId);
        toast.style = Toast.Style.Success;
        toast.title = "Create Task";
        toast.message = "Copied link to clipboard";
        setTimeout(() => {
          // popToRoot({ clearSearchBar: true });
          closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
        }, 1500);
      } else {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed create Task";
        toast.message = response.message;
      }
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed create Task";
      toast.message = String(error);
    }
  }

  return <Action.SubmitForm icon={Icon.Upload} title="Create Task" onSubmit={handleSubmit} />;
}
