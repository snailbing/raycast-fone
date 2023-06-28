import { showToast, Toast, getPreferenceValues } from "@raycast/api";
import { getCalendarEvents, updateEventUrlById } from "./utils/jxa";
import { createTaskAndEditWeekWork, Preferences } from "./service/foneApi";

const { projectId } = getPreferenceValues<Preferences>();

export default async function Command() {
  const sep = 3 * 24 * 60 * 60 * 1000;
  const curDate = new Date();
  const endDate = new Date(curDate.getTime() + sep);
  const startDate = new Date(curDate.getTime() - sep);
  const events = await getCalendarEvents("Fone", startDate, endDate);
  console.log(events);
  JSON.parse(events).forEach(async (element: { summary: string; endDate: number; startDate: number; description: string; id: string; }) => {
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

    const taskUrl = "https://fone.come-future.com/fone/projectDetail/task/" + projectId + "?workItemId=" + itemId;
    console.log(taskUrl)
    await updateEventUrlById("Fone", taskUrl, element.id);
  });
  showToast(Toast.Style.Success, "Success", "Sync Calendar Event To Fone Tasks Success");
}
