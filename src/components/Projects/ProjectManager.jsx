import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Progress } from '@/components/ui/progress';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { 
      Plus, 
      Calendar, 
      Users, 
      FileText, 
      Upload,
      Download,
      MessageSquare,
      Clock,
      CheckCircle,
      AlertTriangle
    } from 'lucide-react';
    import { useAuth } from '@/hooks/useAuth';
    import { useLocalStorage } from '@/hooks/useLocalStorage';

    const ProjectManager = () => {
      const { user } = useAuth();
      const [projects, setProjects] = useLocalStorage('projects', [
        {
          id: 1,
          name: 'E-commerce Website',
          client: 'TechCorp Inc.',
          status: 'In Progress',
          progress: 75,
          dueDate: '2024-01-15',
          tasks: [
            { id: 1, title: 'Design Homepage', status: 'completed', assignee: 'John Doe' },
            { id: 2, title: 'Develop Product Pages', status: 'in-progress', assignee: 'Jane Smith' },
            { id: 3, title: 'Payment Integration', status: 'pending', assignee: 'Mike Johnson' },
            { id: 4, title: 'Testing & QA', status: 'pending', assignee: 'Sarah Wilson' }
          ],
          files: [
            { name: 'Design_Mockups.pdf', size: '2.4 MB', uploadedBy: 'John Doe', date: '2024-01-05' },
            { name: 'Brand_Guidelines.pdf', size: '1.8 MB', uploadedBy: 'Client', date: '2024-01-03' }
          ],
          notes: [
            { id: 1, content: 'Client requested color scheme changes', author: 'John Doe', date: '2024-01-05' },
            { id: 2, content: 'Payment gateway integration completed', author: 'Mike Johnson', date: '2024-01-04' }
          ]
        },
        {
          id: 2,
          name: 'Mobile App Design',
          client: 'StartupXYZ',
          status: 'Design Phase',
          progress: 45,
          dueDate: '2024-01-20',
          tasks: [
            { id: 1, title: 'User Research', status: 'completed', assignee: 'Alice Brown' },
            { id: 2, title: 'Wireframing', status: 'in-progress', assignee: 'Bob Wilson' },
            { id: 3, title: 'UI Design', status: 'pending', assignee: 'Carol Davis' },
            { id: 4, title: 'Prototype', status: 'pending', assignee: 'David Lee' }
          ],
          files: [
            { name: 'User_Research.pdf', size: '3.2 MB', uploadedBy: 'Alice Brown', date: '2024-01-02' }
          ],
          notes: [
            { id: 1, content: 'Initial wireframes approved by client', author: 'Bob Wilson', date: '2024-01-03' }
          ]
        }
      ]);

      const [selectedProject, setSelectedProject] = useState(projects[0]);

      const getStatusColor = (status) => {
        switch (status) {
          case 'completed': return 'bg-green-500';
          case 'in-progress': return 'bg-blue-500';
          case 'pending': return 'bg-orange-500';
          case 'on-hold': return 'bg-red-500';
          default: return 'bg-gray-500';
        }
      };

      const getStatusIcon = (status) => {
        switch (status) {
          case 'completed': return CheckCircle;
          case 'in-progress': return Clock;
          case 'pending': return AlertTriangle;
          default: return Clock;
        }
      };

      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Project Management</h1>
              <p className="text-slate-800 dark:text-slate-400 mt-2">
                {user?.role === 'admin' 
                  ? 'Manage all client projects and track progress' 
                  : 'View your project progress and collaborate with the team'
                }
              </p>
            </div>
            {user?.role === 'admin' && (
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 mt-4 sm:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="glass-effect border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Projects</CardTitle>
                  <CardDescription className="text-slate-400">
                    {projects.length} active projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedProject.id === project.id 
                          ? 'bg-blue-600/20 border border-blue-500' 
                          : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium text-sm">{project.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs mb-3">{project.client}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Progress</span>
                          <span className="text-slate-300 text-xs">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-slate-400 text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          {project.dueDate}
                        </div>
                        <div className="flex items-center text-slate-400 text-xs">
                          <Users className="mr-1 h-3 w-3" />
                          {project.tasks.length}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="glass-effect border-slate-700">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{selectedProject.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {selectedProject.client} • Due {selectedProject.dueDate}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-slate-300 mt-2 sm:mt-0">
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Overall Progress</span>
                      <span className="text-white text-sm font-medium">{selectedProject.progress}%</span>
                    </div>
                    <Progress value={selectedProject.progress} className="h-3" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                      <TabsTrigger value="tasks">Tasks</TabsTrigger>
                      <TabsTrigger value="files">Files</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Project Tasks</h4>
                        {user?.role === 'admin' && (
                          <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {selectedProject.tasks.map((task) => {
                          const StatusIcon = getStatusIcon(task.status);
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3 sm:space-y-0"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${getStatusColor(task.status)}`}>
                                  <StatusIcon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{task.title}</p>
                                  <p className="text-slate-400 text-sm">Assigned to {task.assignee}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="capitalize self-end sm:self-auto">
                                {task.status.replace('-', ' ')}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Project Files</h4>
                        <Button size="sm" variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {selectedProject.files.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-blue-600 flex-shrink-0">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium truncate">{file.name}</p>
                                <p className="text-slate-400 text-xs truncate">
                                  {file.size} • Uploaded by {file.uploadedBy} on {file.date}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="mt-2 sm:mt-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Project Notes</h4>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Note
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {selectedProject.notes.map((note) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                          >
                            <p className="text-white mb-2">{note.content}</p>
                            <div className="flex items-center justify-between text-slate-400 text-sm">
                              <span>By {note.author}</span>
                              <span>{note.date}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4 mt-6">
                      <h4 className="text-white font-medium">Project Timeline</h4>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-white font-medium">Project Started</p>
                            <p className="text-slate-400 text-sm">Initial planning and requirements gathering</p>
                            <p className="text-slate-500 text-xs mt-1">January 1, 2024</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-white font-medium">Design Phase Completed</p>
                            <p className="text-slate-400 text-sm">All mockups and wireframes approved</p>
                            <p className="text-slate-500 text-xs mt-1">January 5, 2024</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-white font-medium">Development In Progress</p>
                            <p className="text-slate-400 text-sm">Frontend and backend development ongoing</p>
                            <p className="text-slate-500 text-xs mt-1">January 8, 2024</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      );
    };

    export default ProjectManager;