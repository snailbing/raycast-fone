import { ActionPanel, Form, Icon, showToast, Toast, Action, Clipboard, getPreferenceValues, closeMainWindow, PopToRootType } from "@raycast/api";
import { createTask, Preferences } from "./service/foneApi";
import { setTimeout } from "timers";

const { projectId } = getPreferenceValues<Preferences>();

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

      <Form.Dropdown id="project" title="所属项目" storeValue>
        <Form.Dropdown.Item value="21005" title="浙一项目-金刚电子病历" />
        <Form.Dropdown.Item value="32006" title="富阳中医骨伤项目/大HIS" />
        <Form.Dropdown.Item value="17040" title="余杭二院、三院、良渚医院数据及业务中台项目" />
        <Form.Dropdown.Item value="17014" title="上海中山项目--老年医学中心项目" />
        <Form.Dropdown.Item value="25001" title="上海中山佘山院区项目" />
      </Form.Dropdown>

      <Form.Dropdown id="product" title="所属产品模块" storeValue>
        <Form.Dropdown.Item value="35005" title="金刚电子病历" />
        <Form.Dropdown.Item value="17011" title="护理中心" />
        <Form.Dropdown.Item value="17021" title="住院" />
        <Form.Dropdown.Item value="16001" title="HBOS" />
      </Form.Dropdown>

      <Form.TextArea id="description" title="内容" placeholder="Enter task content ..." />
    </Form>
  );
}

const projectDic = new Map<string, string>([
  ["21005", "浙一项目-金刚电子病历"],
  ["32006", "富阳中医骨伤项目/大HIS"],
  ["17040", "余杭二院、三院、良渚医院数据及业务中台项目"],
  ["17014", "上海中山项目--老年医学中心项目"],
  ["25001", "上海中山佘山院区项目"],
]);

const productDic = new Map<string, string>([
  ["35005", "金刚电子病历"],
  ["17011", "护理中心"],
  ["17021", "住院"],
  ["16001", "HBOS"],
]);

function CreateTaskAction() {
  async function handleSubmit(values: { title: string; product: string; project: string; description: string }) {
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
