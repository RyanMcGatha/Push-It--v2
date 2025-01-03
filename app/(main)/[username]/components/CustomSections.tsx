import { Move, Plus, X, GripVertical } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import { CustomSection } from "./types";

interface CustomSectionsProps {
  sections?: CustomSection[];
  isEditing: boolean;
  onSectionsChange: (sections: CustomSection[]) => void;
}

interface DragDropWrapperProps {
  children: (
    provided: DroppableProvided,
    snapshot: DroppableStateSnapshot
  ) => React.ReactElement<HTMLDivElement>;
  onDragEnd: (result: DropResult) => void;
}

const DragDropContextWrapper = dynamic(
  () =>
    import("react-beautiful-dnd").then((mod) => {
      const { DragDropContext, Droppable } = mod;
      return function DragDropWrapper({
        children,
        onDragEnd,
      }: DragDropWrapperProps) {
        return (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="custom-sections">{children}</Droppable>
          </DragDropContext>
        );
      };
    }),
  { ssr: false }
);

export function CustomSections({
  sections,
  isEditing,
  onSectionsChange,
}: CustomSectionsProps) {
  const safeSections = sections ?? [];

  const handleSectionAdd = () => {
    const newSection = {
      id: Date.now().toString(),
      title: "New Section",
      content: "",
      order: safeSections.length,
    };
    onSectionsChange([...safeSections, newSection]);
  };

  const handleSectionChange = (
    id: string,
    field: "title" | "content",
    value: string
  ) => {
    onSectionsChange(
      safeSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const handleSectionRemove = (id: string) => {
    onSectionsChange(safeSections.filter((section) => section.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(safeSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onSectionsChange(items.map((item, index) => ({ ...item, order: index })));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSectionAdd}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </motion.div>
      )}
      <DragDropContextWrapper onDragEnd={onDragEnd}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-6"
          >
            <AnimatePresence>
              {safeSections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided: DraggableProvided) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`prose dark:prose-invert max-w-none ${
                          isEditing
                            ? "border rounded-xl p-6 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            {isEditing ? (
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) =>
                                  handleSectionChange(
                                    section.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg px-2 py-1 w-full"
                                placeholder="Section Title"
                              />
                            ) : (
                              <motion.h2
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-2xl font-bold"
                              >
                                {section.title}
                              </motion.h2>
                            )}
                          </div>
                          {isEditing && (
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move p-1.5 rounded-md hover:bg-muted/80 transition-colors duration-200"
                              >
                                <GripVertical className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <button
                                onClick={() => handleSectionRemove(section.id)}
                                className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <textarea
                            value={section.content}
                            onChange={(e) =>
                              handleSectionChange(
                                section.id,
                                "content",
                                e.target.value
                              )
                            }
                            rows={4}
                            placeholder="Write your content here..."
                            className="w-full px-4 py-3 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                          />
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: section.content.replace(/\n/g, "<br />"),
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </Draggable>
                ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </DragDropContextWrapper>
    </motion.div>
  );
}
