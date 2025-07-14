import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import LeadCard from '@/components/Leads/LeadCard';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { ORDERED_LEAD_STAGES, LEAD_STAGES_CONFIG } from '@/lib/leadStages';

const SortableLeadItem = ({ lead, onEditLead, onMoveLead, isFirstStage, isLastStage }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <LeadCard 
        lead={lead} 
        onEdit={onEditLead} 
        isDraggable={true}
        className={`mb-3 ${isDragging ? 'opacity-50' : ''}`}
        onMove={(direction) => onMoveLead(lead.id, direction)}
        isFirstStage={isFirstStage}
        isLastStage={isLastStage}
        listeners={listeners}
      />
    </div>
  );
};

const PipelineColumn = ({ stage, leadsInStage, onEditLead, onMoveLead }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="bg-slate-900/60 p-3 rounded-xl flex flex-col w-[320px] flex-shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-base uppercase tracking-wider">{stage.label}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{LEAD_STAGES_CONFIG[stage.id]?.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-sm">
          {leadsInStage.length}
        </Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={`flex-grow min-h-[100px] overflow-y-auto pr-1 rounded-lg transition-colors ${isOver ? 'bg-slate-800/50' : ''}`}
      >
        <SortableContext items={leadsInStage.map(l => l.id)} id={stage.id} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {leadsInStage.map(lead => {
              const currentStageIndex = ORDERED_LEAD_STAGES.findIndex(s => s.id === lead.stage);
              const isFirstStage = currentStageIndex === 0;
              const isLastStage = currentStageIndex === ORDERED_LEAD_STAGES.length - 1;
              return (
                <SortableLeadItem 
                  key={lead.id} 
                  lead={lead} 
                  onEditLead={onEditLead} 
                  onMoveLead={onMoveLead}
                  isFirstStage={isFirstStage}
                  isLastStage={isLastStage}
                />
              );
            })}
            {leadsInStage.length === 0 && (
              <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-700">
                <p className="text-slate-500 text-sm">Drop leads here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const LeadPipelineView = ({ leads, onEditLead, onStageChange }) => {
  const [pipelineLeads, setPipelineLeads] = useState(leads);
  const [activeLead, setActiveLead] = useState(null);

  useEffect(() => {
    setPipelineLeads(leads);
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleMoveLead = (leadId, direction) => {
    const lead = pipelineLeads.find(l => l.id === leadId);
    if (!lead) return;

    const currentStageIndex = ORDERED_LEAD_STAGES.findIndex(s => s.id === lead.stage);
    if (currentStageIndex === -1) return;

    let nextStageIndex;
    if (direction === 'left') {
      nextStageIndex = currentStageIndex - 1;
    } else {
      nextStageIndex = currentStageIndex + 1;
    }

    if (nextStageIndex >= 0 && nextStageIndex < ORDERED_LEAD_STAGES.length) {
      const newStage = ORDERED_LEAD_STAGES[nextStageIndex].id;
      setPipelineLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      onStageChange(leadId, newStage);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveLead(pipelineLeads.find(l => l.id === active.id) || null);
  };

  const handleDragEnd = (event) => {
    setActiveLead(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (activeContainer !== overContainer) {
      setPipelineLeads(prev => prev.map(l => l.id === activeId ? { ...l, stage: overContainer } : l));
      onStageChange(activeId, overContainer);
    } else {
      const itemsInStage = pipelineLeads.filter(l => l.stage === activeContainer);
      const oldIndex = itemsInStage.findIndex(item => item.id === activeId);
      const newIndex = itemsInStage.findIndex(item => item.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(itemsInStage, oldIndex, newIndex);
        const otherItems = pipelineLeads.filter(l => l.stage !== activeContainer);
        setPipelineLeads([...otherItems, ...reorderedItems]);
      }
    }
  };

  const leadsByStage = ORDERED_LEAD_STAGES.reduce((acc, stage) => {
    acc[stage.id] = pipelineLeads.filter(lead => lead.stage === stage.id);
    return acc;
  }, {});

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {ORDERED_LEAD_STAGES.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leadsInStage={leadsByStage[stage.id] || []}
            onEditLead={onEditLead}
            onMoveLead={handleMoveLead}
          />
        ))}
      </div>
      {createPortal(
        <DragOverlay>
          {activeLead && (
            <LeadCard
              lead={activeLead}
              isDraggable
              className="shadow-2xl opacity-95"
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default LeadPipelineView;