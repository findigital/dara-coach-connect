import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import VoiceInteraction from "@/components/sessions/VoiceInteraction";
import WellnessActivities from "@/components/sessions/WellnessActivities";
import WellnessNotes from "@/components/sessions/WellnessNotes";
import Navigation from "@/components/Navigation";

const Wellness = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold text-dara-navy px-2">Wellness</h2>
          </div>
          <ResizablePanelGroup direction="horizontal" className="hidden lg:flex h-screen">
            <ResizablePanel defaultSize={33} minSize={30}>
              <VoiceInteraction />
            </ResizablePanel>
            <ResizablePanel defaultSize={33} minSize={30}>
              <WellnessActivities />
            </ResizablePanel>
            <ResizablePanel defaultSize={33} minSize={30}>
              <WellnessNotes />
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col h-[calc(100vh-4rem)]">
            <div className="h-1/3 min-h-[300px] border-b">
              <VoiceInteraction />
            </div>
            <div className="h-1/3 min-h-[300px] border-b overflow-y-auto">
              <WellnessActivities />
            </div>
            <div className="h-1/3 min-h-[300px] overflow-y-auto">
              <WellnessNotes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wellness;