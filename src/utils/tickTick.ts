import { showToast, Toast } from "@raycast/api";
import { runAppleScript } from "run-applescript";
import { Section, TickTickTask } from "../service/task";
import { convertMacTime2JSTime, getSectionNameByDate } from "./date";

const checkAppInstalled = async () => {
    try {
      const result = await runAppleScript(`
      exists application "TickTick"
      `);
  
      if (result === "false") {
        showToast(
          Toast.Style.Failure,
          "Application not found",
          "Please install TickTick or upgrade to the latest version."
        );
        return false;
      }
  
      return true;
    } catch (error) {
      showToast(
        Toast.Style.Failure,
        "Application not found",
        "Please install TickTick or upgrade to the latest version."
      );
      return false;
    }
  };

export const addTickTickTask = async (data: {
    projectId: string;
    title: string;
    description: string;
    dueDate?: string;
    isAllDay: boolean;
  }) => {
    const { projectId, title, description, dueDate, isAllDay } = data;
    const installed = await checkAppInstalled();
    if (!installed) return undefined;
  
    try {
      const result = (await runAppleScript(`
      set result to ""
      tell application "TickTick"
        set result to add task to list "${projectId}" title "${title}" description "${description}" ${dueDate ? ` due date "${dueDate}"` : ""} from "raycast fone" ${isAllDay ? "with" : "without"} allday
      end tell
  
    `)) as string;
      if (result === "missing value") {
        return false;
      }
      if (result === "true") return true;
      return false;
    } catch (e) {
      return undefined;
    }
  };

  const taskObject2Task = (object: Record<string, unknown>): TickTickTask => {
    return {
      id: object.id as TickTickTask["id"],
      title: object.title as TickTickTask["title"],
      content: object.content as TickTickTask["content"],
      desc: object.desc as TickTickTask["desc"],
      priority: object.priority as TickTickTask["priority"],
      projectId: object.projectId as TickTickTask["projectId"],
      items: object.items as TickTickTask["items"],
      kind: object.kind as TickTickTask["kind"],
      tags: (object.tags || []) as TickTickTask["tags"],
    };
  };

  const errorHandler = (err: unknown) => {
    console.log("parse error", err);
    showToast(Toast.Style.Failure, "Something went wrong");
  };
  
  const getDateListData = async (command: string): Promise<Section[]> => {
    const installed = await checkAppInstalled();
    if (!installed) return [];
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
          name: section.date === 0 ? "No Date" : getSectionNameByDate(new Date(convertMacTime2JSTime(section.date))),
          children: section.tasks.map(taskObject2Task),
        };
      });
    } catch (e) {
      errorHandler(e);
      return [];
    }
  };

  export const getTasksByProjectId = async (id: string) => {
    return getDateListData(`
      set result to ""
      tell application "TickTick"
        tasks in "${id}"    
      end tell
      return result
    `);
  };