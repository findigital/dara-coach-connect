import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";
import WellnessActivities from "@/components/sessions/WellnessActivities";
import WellnessNotes from "@/components/sessions/WellnessNotes";
import Navigation from "@/components/Navigation";

const Wellness = () => {
  return (
    <div className="min-h-screen bg-white flex">
      <Navigation />
      
      <div className="flex-1 lg:ml-64">
        <main className="min-h-screen pt-16 lg:pt-0">
          {/* Desktop Layout */}
          <ResizablePanelGroup 
            direction="horizontal" 
            className="hidden lg:flex h-[calc(100vh-2rem)]"
          >
            <ResizablePanel defaultSize={50} minSize={30}>
              <WellnessActivities />
            </ResizablePanel>
            <ResizablePanel defaultSize={50} minSize={30}>
              <WellnessNotes />
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col h-full">
            <div className="p-4">
              <h1 className="text-2xl font-semibold text-dara-navy">Wellness</h1>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <div className="bg-white rounded-lg shadow-sm">
                <WellnessActivities />
              </div>
              <div className="bg-white rounded-lg shadow-sm">
                <WellnessNotes />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wellness;