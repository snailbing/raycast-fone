import { List } from "@raycast/api";
import React, { useMemo, useState } from "react";
import { getTaskCopyContent, getTaskDetailMarkdownContent } from "./service/task";
import useStartApp from "./hooks/useStartApp";
import TaskItem from "./components/taskItem";
import useSearchTasks from "./hooks/useSearchTasks";
import { getProjects } from "./service/project";
import SearchFilter from "./components/searchFilter";

const TickTickSearch: React.FC<Record<string, never>> = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState("all");
  const { isInitCompleted } = useStartApp();

  const filterSections = useMemo(() => {
    if (isInitCompleted) {
      return [
        { id: "hide", name: "Hide", filters: [{ id: "all", name: "All" }] },
        {
          id: "list",
          name: "Project",
          filters: getProjects().map((project) => ({ id: project.id, name: project.name })),
        },
      ];
    }
    return [];
  }, [isInitCompleted]);

  const { searchTasks, isSearching } = useSearchTasks({ searchQuery, isInitCompleted });

  const isLoading = useMemo(() => {
    if (!isInitCompleted) {
      return true;
    }
    return isSearching;
  }, [isInitCompleted, isSearching]);

  const onFilterChange = (filterId: string) => {
    setProjectFilter(filterId);
  };

  const renderTasks = useMemo(() => {
    if (!searchTasks) {
      return [];
    }

    const filteredTasks =
      projectFilter === "all"
        ? searchTasks
        : searchTasks.filter((task) => {
            return task.bizProjectId === projectFilter;
          });

    return filteredTasks.map((task) => (
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
      />
    ));
  }, [projectFilter, searchTasks]);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchQuery}
      searchBarPlaceholder="Search all tasks..."
      isShowingDetail
      searchBarAccessory={<SearchFilter filterSections={filterSections} onFilterChange={onFilterChange} />}
    >
      {!searchTasks && renderTasks.length === 0 ? (
        <List.EmptyView title="Type something to search tasks" />
      ) : (
        renderTasks
      )}
    </List>
  );
};

export default TickTickSearch;
