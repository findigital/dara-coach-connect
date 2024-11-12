import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoiceInteraction from "@/components/sessions/VoiceInteraction";
import SessionNotes from "@/components/sessions/SessionNotes";
import PastSessions from "@/components/sessions/PastSessions";
import Navigation from "@/components/Navigation";

const Sessions = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="h-screen pt-16 lg:pt-0">
          <ResizablePanelGroup direction="horizontal" className="hidden lg:flex">
            <ResizablePanel defaultSize={20} minSize={15}>
              <ScrollArea className="h-full">
                <PastSessions />
              </ScrollArea>
            </ResizablePanel>
            <ResizablePanel defaultSize={40}>
              <VoiceInteraction />
            </ResizablePanel>
            <ResizablePanel defaultSize={40}>
              <SessionNotes />
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* Mobile Layout */}
          <div className="lg:hidden h-full">
            <div className="h-1/3">
              <PastSessions />
            </div>
            <div className="h-1/3">
              <VoiceInteraction />
            </div>
            <div className="h-1/3">
              <SessionNotes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sessions;