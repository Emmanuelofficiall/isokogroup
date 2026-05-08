import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ControlCenter from "./ControlCenter";
import UploadData from "./UploadData";
import AnalysisEngine from "./AnalysisEngine";
import InsightsLibrary from "./InsightsLibrary";
import SupportInbox from "./SupportInbox";
import DataAnalysis from "../DataAnalysis";

const InsightsWorkspace = () => {
  return (
    <div className="space-y-4">
      <ControlCenter />
      <Tabs defaultValue="engine" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="engine">Analysis Engine</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="library">Insights Library</TabsTrigger>
          <TabsTrigger value="support">Support Inbox</TabsTrigger>
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="engine"><AnalysisEngine /></TabsContent>
        <TabsContent value="upload"><UploadData /></TabsContent>
        <TabsContent value="library"><InsightsLibrary /></TabsContent>
        <TabsContent value="support"><SupportInbox /></TabsContent>
        <TabsContent value="overview"><DataAnalysis /></TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsWorkspace;
