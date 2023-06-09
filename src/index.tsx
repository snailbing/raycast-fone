import { List } from "@raycast/api";
import React, { useEffect, useMemo, useState } from "react";
import { getToday } from "./service/foneApi";
import { getTaskCopyContent, getTaskDetailMarkdownContent, Task } from "./service/task";
import useStartApp from "./hooks/useStartApp";
import TaskItem from "./components/taskItem";
import useSearchTasks from "./hooks/useSearchTasks";

const FoneTasks: React.FC<Record<string, never>> = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [todaySections, setTodaySections] = useState<Task[] | null>(null);
  const { isInitCompleted } = useStartApp();

  useEffect(() => {
    const getTodayTasks = async () => {
      const today = await getToday();
      setTodaySections(today);
    };

    if (isInitCompleted) {
      getTodayTasks();
    }
  }, [isInitCompleted]);

  const removeOneTask = (b: boolean, taskId: string) => {
    if (b) {
      const today = todaySections?.filter((task) => task.id !== taskId);
      setTodaySections(today);
    }
  };

  const { searchTasks, isSearching } = useSearchTasks({ searchQuery, isInitCompleted });

  const isLoading = useMemo(() => {
    if (!isInitCompleted) {
      return true;
    }

    if (searchQuery) {
      return isSearching;
    }
    return todaySections == null;
  }, [isInitCompleted, searchQuery, isSearching, todaySections]);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchQuery}
      searchBarPlaceholder="Search all tasks..."
      isShowingDetail
    >
      {searchTasks
        ? searchTasks.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              projectId={task.projectId}
              bizProjectName={task.bizProjectName}
              bizProjectId={task.bizProjectId}
              priority={task.priority}
              state={task.state}
              detailMarkdown={getTaskDetailMarkdownContent(task)}
              copyContent={getTaskCopyContent(task)}
              onTaskFinish={removeOneTask}
            />
          ))
        : todaySections?.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              projectId={task.projectId}
              bizProjectName={task.bizProjectName}
              bizProjectId={task.bizProjectId}
              priority={task.priority}
              state={task.state}
              detailMarkdown={getTaskDetailMarkdownContent(task)}
              copyContent={getTaskCopyContent(task)}
              onTaskFinish={removeOneTask}
            />
          ))}
    </List>
  );
};

export default FoneTasks;
