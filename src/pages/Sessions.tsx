import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import VoiceInteraction from "@/components/sessions/VoiceInteraction";
import SessionNotes from "@/components/sessions/SessionNotes";
import Navigation from "@/components/Navigation";

const Sessions = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="min-h-screen pt-16 lg:pt-0">
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold text-dara-navy px-2">Start Session</h2>
          </div>

          {/* Desktop Layout with side-by-side panels */}
          <div className="hidden lg:block h-[calc(100vh-8rem)]">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={50} minSize={30}>
                <VoiceInteraction />
              </ResizablePanel>
              <ResizablePanel defaultSize={50} minSize={30}>
                <SessionNotes />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Mobile Layout with stacked panels */}
          <div className="lg:hidden flex flex-col space-y-4 p-4 pb-20">
            <div className="min-h-[500px] overflow-y-auto bg-white rounded-lg shadow">
              <VoiceInteraction />
            </div>
            <div className="min-h-[500px] overflow-y-auto bg-white rounded-lg shadow">
              <SessionNotes />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sessions;