
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";

// Mock Data reflecting the project's structure
const kpiData = [
  {
    title: "Total Projects",
    value: "124",
    change: "+2.5%",
    icon: <Building2 className="h-6 w-6 text-gray-600" />,
  },
  {
    title: "Active Tasks",
    value: "832",
    change: "+10.1%",
    icon: <ClipboardList className="h-6 w-6 text-gray-600" />,
  },
  {
    title: "Pending Approvals",
    value: "16",
    change: "-5.2%",
    isNegative: true,
    icon: <CheckCircle2 className="h-6 w-6 text-gray-600" />,
  },
  {
    title: "Overdue Items",
    value: "8",
    change: "+12%",
    isNegative: true,
    icon: <AlertTriangle className="h-6 w-6 text-gray-600" />,
  },
];

const recentProjects = [
  {
    name: "Marina Bay Tower",
    status: "In Progress",
    progress: 65,
    team: ["AV", "JK", "LM"],
  },
  {
    name: "Skyline Corporate Center",
    status: "Completed",
    progress: 100,
    team: ["RS", "MW"],
  },
  {
    name: "Quantum Industrial Park",
    status: "On Hold",
    progress: 20,
    team: ["CB", "DE", "FG"],
  },
  {
    name: "Heritage Grand Hotel",
    status: "Pending",
    progress: 0,
    team: ["HI"],
  },
    {
    name: "Pioneer Bridge Construction",
    status: "In Progress",
    progress: 45,
    team: ["SA", "TB"],
  },
];

const statusBadgeColors: { [key: string]: string } = {
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  'On Hold': 'bg-gray-200 text-gray-800 border-gray-400 hover:bg-gray-300',
  'Pending': 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
};


export default function GeminiDashboardPage() {
  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-700">A summary of your projects and tasks.</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="border-gray-400 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
              <p className={`text-xs ${kpi.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {kpi.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects Table */}
      <Card className="border-gray-400">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Projects</CardTitle>
          <CardDescription className="text-gray-800">An overview of the latest projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-gray-400 hover:bg-gray-200">
                <TableHead className="font-bold text-gray-800">Project Name</TableHead>
                <TableHead className="font-bold text-gray-800">Status</TableHead>
                <TableHead className="font-bold text-gray-800">Team</TableHead>
                <TableHead className="font-bold text-gray-800 text-right">Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProjects.map((project) => (
                <TableRow key={project.name} className="hover:bg-gray-200 transition-colors border-b-gray-400">
                  <TableCell className="font-medium text-gray-900">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${statusBadgeColors[project.status] || ''} font-semibold`}>{project.status}</Badge>
                  </TableCell>
                  <TableCell className="flex items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                        {project.team.map(initials => (
                            <Avatar key={initials} className="h-8 w-8 border-2 border-white inline-block">
                                <AvatarFallback className="bg-gray-300 text-gray-800 text-xs font-bold">{initials}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-4">
                        <span className="text-gray-800 font-medium w-12">{project.progress}%</span>
                        <Progress value={project.progress} className="w-32 h-2 bg-gray-300" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
