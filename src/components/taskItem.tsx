import { Action, ActionPanel, Color, Icon, List, showToast, Toast } from "@raycast/api";
import { useMemo } from "react";
import { changTaskState } from "../service/foneApi";
import { Task } from "../service/task";
import { addSpaceBetweenEmojiAndText } from "../utils/text";
import { completedTickFoneTask } from "../service/tickApi";

const TaskItem: React.FC<{
  id: Task["id"];
  title: Task["title"];
  priority: Task["prioritySort"];
  projectId: Task["projectId"];
  bizProjectName: Task["project"]["label"];
  bizProjectId: Task["project"]["value"];
  state: Task["state"]["label"];
  detailMarkdown: string;
  copyContent: string;
  onTaskFinish: any;
}> = (props) => {
  const { id, title, priority, projectId, bizProjectName, detailMarkdown, state, copyContent, onTaskFinish } = props;

  const checkboxColor = useMemo(() => {
    switch (priority) {
      case 0:
        return Color.PrimaryText;
      case 1:
        return Color.Blue;
      case 3:
        return Color.Yellow;
      case 5:
        return Color.Red;
      default:
        return Color.PrimaryText;
    }
  }, [priority]);

  const priorityText = useMemo(() => {
    switch (priority) {
      case 1:
        return "Low";
      case 3:
        return "Medium";
      case 5:
        return "High";
      case 0:
      default:
        return "None";
    }
  }, [priority]);

  const target = useMemo(() => {
    return `https://fone.come-future.com/fone/projectDetail/task/${projectId}?workItemId=${id}`;
  }, [id, projectId]);

  const taskFinish = async (values: any) => {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Finish Fone Task" });

    try {
      const response = await changTaskState(values.id, "36");

      if (response && response.success == true) {
        //   await Clipboard.copy((body as any).authenticated_url);
        const res = await completedTickFoneTask(target);
        console.log("完成" + target + JSON.stringify(res));
        toast.style = Toast.Style.Success;
        toast.title = "Finish Task";
        // toast.message = "Copied link to clipboard";
        return true;
      } else {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed finish Task";
        toast.message = response.message;
      }
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed finish Task";
      toast.message = String(error);
    }
    return false;
  };

  return (
    <List.Item
      title={title || "Untitled"}
      icon={{ source: Icon.Circle, tintColor: checkboxColor }}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="打开" url={target} icon={Icon.Eye} />
          <Action.CopyToClipboard title="Copy" content={copyContent} icon={Icon.Clipboard} />
          <Action
            title="完成"
            icon={Icon.Circle}
            onAction={() => {
              const b = taskFinish(props);
              if (b) {
                onTaskFinish(b, id);
              }
            }}
          />
        </ActionPanel>
      }
      accessoryTitle={addSpaceBetweenEmojiAndText(bizProjectName)}
      detail={
        <List.Item.Detail
          markdown={detailMarkdown}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Poejct" text={addSpaceBetweenEmojiAndText(bizProjectName)} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label
                title="Priority"
                text={priorityText}
                icon={{ source: Icon.Dot, tintColor: checkboxColor }}
              />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="State" text={state} />
              <List.Item.Detail.Metadata.Separator />
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
};

export default TaskItem;
