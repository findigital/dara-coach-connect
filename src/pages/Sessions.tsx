import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import VoiceInteraction from "@/components/sessions/VoiceInteraction";
import SessionNotes from "@/components/sessions/SessionNotes";
import Navigation from "@/components/Navigation";

const Sessions = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <ResizablePanelGroup direction="horizontal" className="hidden lg:flex h-screen">
            <ResizablePanel defaultSize={50} minSize={30}>
              <VoiceInteraction />
            </ResizablePanel>
            <ResizablePanel defaultSize={50} minSize={30}>
              <SessionNotes />
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col h-[calc(100vh-4rem)]">
            <div className="h-1/2 min-h-[300px] border-b">
              <VoiceInteraction />
            </div>
            <div className="h-1/2 min-h-[300px] overflow-y-auto">
              <SessionNotes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sessions;